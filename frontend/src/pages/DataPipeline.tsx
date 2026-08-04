import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import { Upload, Activity, FileText, BarChart3, FileIcon, Database, Users, Package, ShoppingCart, AlertTriangle, PlusCircle, RefreshCw, Trash2, Check } from 'lucide-react';
import { pipelineApi, etlApi, SampleDatasetMetadata, UploadResponse, ETLRunResponse } from '../services/api';
import { useETL } from '../context/ETLContext';

const DataPipeline: React.FC = () => {
  const { runningPipeline, setRunningPipeline, etlStatus, setEtlStatus, etlLogs, setEtlLogs, resetPipelineState } = useETL();
  const [datasetSource, setDatasetSource] = useState<'sample' | 'custom'>('sample');
  const [isDragging, setIsDragging] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace' | 'clear'>('append');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // File retention mode state
  const [fileRetentionMode, setFileRetentionMode] = useState<'delete' | 'archive'>('delete');
  const [archivePin, setArchivePin] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [archiveModeVerified, setArchiveModeVerified] = useState(false);
  const [archiveVerificationError, setArchiveVerificationError] = useState<string | null>(null);
  
  // Track the last custom import mode to restore when switching back to custom dataset
  const [lastCustomImportMode, setLastCustomImportMode] = useState<'append' | 'replace' | 'clear'>('append');
  
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Sample dataset state
  const [sampleMetadata, setSampleMetadata] = useState<SampleDatasetMetadata | null>(null);
  const [loadingSampleMetadata, setLoadingSampleMetadata] = useState(false);
  const [samplePipelineResult, setSamplePipelineResult] = useState<ETLRunResponse | null>(null);

  // Custom dataset state
  const [uploading, setUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [customPipelineResult, setCustomPipelineResult] = useState<ETLRunResponse | null>(null);

  useEffect(() => {
    const fetchSampleMetadata = async () => {
      if (datasetSource === 'sample') {
        setLoadingSampleMetadata(true);
        try {
          const metadata = await pipelineApi.getSampleDatasetMetadata();
          setSampleMetadata(metadata);
        } catch (error) {
          console.error('Failed to fetch sample dataset metadata:', error);
          setSampleMetadata(null);
        } finally {
          setLoadingSampleMetadata(false);
        }
      } else {
        setSampleMetadata(null);
      }
    };

    fetchSampleMetadata();
  }, [datasetSource]);

  // Fetch and restore persistent ETL state on page load
  useEffect(() => {
    const fetchETLState = async () => {
      try {
        const state = await etlApi.getETLState();
        
        // Restore dataset source and import mode
        setDatasetSource(state.dataset_source as 'sample' | 'custom');
        setImportMode(state.import_mode as 'append' | 'replace' | 'clear');
        
        // Restore pipeline results from last execution
        if (state.last_execution) {
          const pipelineResult: ETLRunResponse = {
            success: true,
            message: 'Last execution completed successfully',
            mode: state.import_mode,
            operation: state.last_execution.operation,
            execution_time: state.last_execution.execution_time,
            customers_inserted: state.last_execution.customers_imported || 0,
            customers_skipped: 0,
            products_inserted: state.last_execution.products_imported || 0,
            products_skipped: 0,
            orders_inserted: state.last_execution.orders_imported || 0,
            orders_skipped: 0,
            total_records_processed: (state.last_execution.customers_imported || 0) + 
                                   (state.last_execution.products_imported || 0) + 
                                   (state.last_execution.orders_imported || 0)
          };
          
          if (state.dataset_source === 'sample') {
            setSamplePipelineResult(pipelineResult);
          } else {
            setCustomPipelineResult(pipelineResult);
          }
        }
        
        // Note: uploaded files are not restored as they may have been cleaned up
        // The user will need to re-upload files if they want to run the pipeline again
      } catch (error) {
        console.error('Failed to fetch ETL state:', error);
      }
    };

    fetchETLState();
  }, []);

  // Poll ETL status and logs while running
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (runningPipeline) {
      intervalId = setInterval(async () => {
        try {
          const [status, logs] = await Promise.all([
            etlApi.getStatus(),
            etlApi.getLogs()
          ]);
          setEtlStatus(status);
          setEtlLogs(logs);

          // Stop polling if pipeline completed or errored
          if (status.status === 'completed' || status.status === 'error' || status.status === 'idle') {
            setRunningPipeline(false);
            if (intervalId) clearInterval(intervalId);
            // Dispatch event to notify other pages to refresh data
            if (status.status === 'completed') {
              window.dispatchEvent(new CustomEvent('etl-completed'));
            }
          }
        } catch (error) {
          console.error('Failed to fetch ETL status/logs:', error);
          // Stop polling on repeated errors
          setRunningPipeline(false);
          if (intervalId) clearInterval(intervalId);
        }
      }, 2000);
      
      // Safety timeout: stop polling after 5 minutes
      timeoutId = setTimeout(() => {
        console.warn('ETL polling timeout reached');
        setRunningPipeline(false);
        if (intervalId) clearInterval(intervalId);
      }, 300000); // 5 minutes
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [runningPipeline]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    setUploadError(null);
    setUploadResponse(null);

    // Upload files to backend
    setUploading(true);
    try {
      const response = await etlApi.uploadFiles(fileArray);
      setUploadResponse(response);
      console.log('Upload response:', response);
    } catch (error) {
      console.error('Failed to upload files:', error);
      setUploadError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  const handleRunPipeline = async () => {
    if (runningPipeline) return;
    
    // Check if archive mode is selected but not verified
    if (datasetSource === 'custom' && fileRetentionMode === 'archive' && !archiveModeVerified) {
      setUploadError('Please verify the PIN to enable archive mode before running the pipeline.');
      return;
    }
    
    // Reset pipeline state before starting new execution
    resetPipelineState();
    setRunningPipeline(true);
    if (datasetSource === 'sample') {
      setSamplePipelineResult(null);
    } else {
      setCustomPipelineResult(null);
    }
    
    try {
      const request = {
        dataset_source: datasetSource,
        import_mode: importMode,
        files: datasetSource === 'custom' && uploadResponse ? uploadResponse.uploadedFiles.map(f => ({
          saved_as: f.savedAs,
          original_name: f.originalName
        })) : undefined
      };
      
      const response = await etlApi.runPipeline(request);
      if (datasetSource === 'sample') {
        setSamplePipelineResult(response);
      } else {
        setCustomPipelineResult(response);
        // Clear upload state after successful custom dataset pipeline execution
        // Only clear if delete mode is selected (archive mode keeps files)
        if (response.success && fileRetentionMode === 'delete') {
          clearUploadState();
        }
      }
      console.log('Pipeline result:', response);
    } catch (error) {
      console.error('Failed to run pipeline:', error);
      if (datasetSource === 'sample') {
        setSamplePipelineResult({
          success: false,
          message: 'Failed to run ETL pipeline. Please try again.',
          mode: importMode
        });
      } else {
        setCustomPipelineResult({
          success: false,
          message: 'Failed to run ETL pipeline. Please try again.',
          mode: importMode
        });
      }
      setRunningPipeline(false);
    }
  };

  const handleImportModeChange = (mode: 'append' | 'replace' | 'clear') => {
    setImportMode(mode);
    // If we're in custom dataset mode, save this as the last custom import mode
    if (datasetSource === 'custom') {
      setLastCustomImportMode(mode);
    }
  };

  const handleDatasetSourceChange = (source: 'sample' | 'custom') => {
    if (source === 'sample') {
      // When switching to sample dataset, save current import mode if it was custom
      if (datasetSource === 'custom') {
        setLastCustomImportMode(importMode);
      }
      // Always set to 'replace' for sample dataset
      setImportMode('replace');
    } else {
      // When switching to custom dataset, restore the last custom import mode
      setImportMode(lastCustomImportMode);
    }
    setDatasetSource(source);
  };

  const confirmReplace = () => {
    setImportMode('replace');
    if (datasetSource === 'custom') {
      setLastCustomImportMode('replace');
    }
    setShowReplaceConfirm(false);
  };

  const confirmClear = async () => {
    setShowClearConfirm(false);
    setRunningPipeline(true);
    setCustomPipelineResult(null);
    setEtlStatus(null);
    setEtlLogs(null);
    
    try {
      const request = {
        dataset_source: 'sample', // Clear mode doesn't need dataset source, but backend expects it
        import_mode: 'clear',
        files: undefined
      };
      
      const response = await etlApi.runPipeline(request);
      setCustomPipelineResult(response);
      console.log('Clear result:', response);
    } catch (error) {
      console.error('Failed to clear dataset:', error);
      setCustomPipelineResult({
        success: false,
        message: 'Failed to clear dataset. Please try again.',
        mode: 'clear'
      });
      setRunningPipeline(false);
    }
  };

  const clearUploadState = () => {
    // Clear upload response and error
    setUploadResponse(null);
    setUploadError(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVerifyArchivePin = async () => {
    if (!archivePin.trim()) {
      setArchiveVerificationError('Please enter a PIN');
      return;
    }

    setVerifyingPin(true);
    setArchiveVerificationError(null);
    
    try {
      const response = await etlApi.verifyArchiveMode(archivePin);
      if (response.success && response.archiveEnabled) {
        setArchiveModeVerified(true);
        setArchiveVerificationError(null);
      } else {
        setArchiveModeVerified(false);
        setArchiveVerificationError(response.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Failed to verify archive PIN:', error);
      setArchiveModeVerified(false);
      setArchiveVerificationError('Failed to verify PIN. Please try again.');
    } finally {
      setVerifyingPin(false);
    }
  };

  const handleFileRetentionModeChange = (mode: 'delete' | 'archive') => {
    setFileRetentionMode(mode);
    // Reset archive verification when switching away from archive mode
    if (mode === 'delete') {
      setArchiveModeVerified(false);
      setArchivePin('');
      setArchiveVerificationError(null);
    }
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Data Pipeline</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage data ingestion and ETL processes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Dataset Source" subtitle="Configure data source connections">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="sample-dataset"
                name="dataset-source"
                value="sample"
                checked={datasetSource === 'sample'}
                onChange={() => handleDatasetSourceChange('sample')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="sample-dataset" className="text-sm font-medium text-gray-700 cursor-pointer">
                Load Sample Dataset
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="custom-dataset"
                name="dataset-source"
                value="custom"
                checked={datasetSource === 'custom'}
                onChange={() => handleDatasetSourceChange('custom')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="custom-dataset" className="text-sm font-medium text-gray-700 cursor-pointer">
                Upload Custom Dataset
              </label>
            </div>

            {datasetSource === 'sample' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {loadingSampleMetadata ? (
                  <div className="text-center text-gray-500 text-sm">Loading dataset information...</div>
                ) : sampleMetadata ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-700">Dataset Name:</span>
                      <span className="text-gray-600">{sampleMetadata.name}</span>
                    </div>
                    {sampleMetadata.description && (
                      <p className="text-xs text-gray-500 ml-6">{sampleMetadata.description}</p>
                    )}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{sampleMetadata.customers}</div>
                          <div className="text-xs text-gray-500">Customers</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{sampleMetadata.products}</div>
                          <div className="text-xs text-gray-500">Products</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{sampleMetadata.orders}</div>
                          <div className="text-xs text-gray-500">Orders</div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleRunPipeline}
                      disabled={runningPipeline}
                      className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {runningPipeline ? 'Running Pipeline...' : 'Load Sample Dataset'}
                    </button>
                    {samplePipelineResult && (
                      <div className={`mt-4 p-3 rounded-lg text-sm ${
                        samplePipelineResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {samplePipelineResult.message}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm">Failed to load dataset information</div>
                )}
              </div>
            )}
          </div>
        </Card>

        {datasetSource === 'custom' && (
          <Card title="Import Mode" subtitle="Choose how the uploaded dataset should be processed." className="transition-all duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                onClick={() => handleImportModeChange('append')}
                className={`relative p-6 rounded-lg border cursor-pointer transition-all duration-200 bg-white flex flex-col ${
                  importMode === 'append'
                    ? 'border-green-500 bg-green-50/30 shadow-sm'
                    : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                }`}
              >
                {importMode === 'append' && (
                  <div className="absolute top-4 right-4 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="flex items-center mb-4">
                  <PlusCircle className={`w-6 h-6 mr-3 ${importMode === 'append' ? 'text-green-600' : 'text-green-500'}`} />
                  <h3 className="text-base font-semibold text-gray-900">Append Dataset</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Add new records while preserving existing data.</p>
                <p className="text-xs text-gray-500 mb-3">Recommended for incremental imports.</p>
                <div className="mt-auto">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                    SAFE
                  </span>
                </div>
              </div>

              <div
                onClick={() => handleImportModeChange('replace')}
                className={`relative p-6 rounded-lg border cursor-pointer transition-all duration-200 bg-white flex flex-col ${
                  importMode === 'replace'
                    ? 'border-amber-500 bg-amber-50/30 shadow-sm'
                    : 'border-gray-200 hover:border-amber-300 hover:shadow-sm'
                }`}
              >
                {importMode === 'replace' && (
                  <div className="absolute top-4 right-4 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="flex items-center mb-4">
                  <RefreshCw className={`w-6 h-6 mr-3 ${importMode === 'replace' ? 'text-amber-600' : 'text-amber-500'}`} />
                  <h3 className="text-base font-semibold text-gray-900">Replace Dataset</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Replace all business data with the uploaded dataset.</p>
                <p className="text-xs text-gray-500 mb-3">Recommended for complete refreshes.</p>
                <div className="mt-auto">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                    MODIFIES DATA
                  </span>
                </div>
              </div>

              <div
                onClick={() => handleImportModeChange('clear')}
                className={`relative p-6 rounded-lg border cursor-pointer transition-all duration-200 bg-white flex flex-col ${
                  importMode === 'clear'
                    ? 'border-red-500 bg-red-50/30 shadow-sm'
                    : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
                }`}
              >
                {importMode === 'clear' && (
                  <div className="absolute top-4 right-4 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="flex items-center mb-4">
                  <Trash2 className={`w-6 h-6 mr-3 ${importMode === 'clear' ? 'text-red-600' : 'text-red-500'}`} />
                  <h3 className="text-base font-semibold text-gray-900">Clear Dataset</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Remove all imported business data.</p>
                <p className="text-xs text-gray-500 mb-3">Recommended before starting with a new dataset.</p>
                <div className="mt-auto">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                    DESTRUCTIVE
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {datasetSource === 'custom' && importMode !== 'clear' && (
          <Card title="Dataset Upload" subtitle="Upload data files for processing" className="transition-all duration-200">
            <div className="">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop files here, or{' '}
                  <label className="text-blue-600 cursor-pointer hover:underline">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv,.json"
                      multiple
                      ref={fileInputRef}
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">Accepts CSV and JSON files</p>
                {uploading && (
                  <p className="text-xs text-blue-600 mt-2">Uploading files...</p>
                )}
                {uploadResponse && (
                  <div className="mt-2 text-xs text-green-600">
                    <p>Uploaded {uploadResponse.uploadedFiles.length} file(s):</p>
                    <ul className="list-disc list-inside">
                      {uploadResponse.uploadedFiles.map((file, idx) => (
                        <li key={idx}>{file.originalName} ({file.size} bytes)</li>
                      ))}
                    </ul>
                  </div>
                )}
                {uploadError && (
                  <p className="text-xs text-red-600 mt-2">{uploadError}</p>
                )}
              </div>

              {!uploadResponse && !uploading && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">No custom dataset uploaded yet.</p>
                </div>
              )}

              {uploadResponse && uploadResponse.uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">File Name</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Size</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Saved As</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResponse.uploadedFiles.map((file, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 px-3 text-sm text-gray-900 flex items-center">
                            <FileIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {file.originalName}
                          </td>
                          <td className="py-2 px-3 text-sm text-gray-600">{file.size} bytes</td>
                          <td className="py-2 px-3 text-sm text-gray-600">{file.savedAs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button 
                    onClick={handleRunPipeline}
                    disabled={runningPipeline || (datasetSource === 'custom' && (!uploadResponse || uploadResponse.uploadedFiles.length === 0))}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {runningPipeline ? 'Running Pipeline...' : 'Run ETL Pipeline'}
                  </button>
                  {customPipelineResult && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${
                      customPipelineResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {customPipelineResult.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {datasetSource === 'custom' && importMode !== 'clear' && (
          <Card title="Uploaded File Retention" subtitle="Choose whether to delete or archive uploaded files after successful import" className="transition-all duration-200">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="delete-files"
                  name="file-retention"
                  value="delete"
                  checked={fileRetentionMode === 'delete'}
                  onChange={() => handleFileRetentionModeChange('delete')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="delete-files" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Delete uploaded files after successful import (Recommended)
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="archive-files"
                  name="file-retention"
                  value="archive"
                  checked={fileRetentionMode === 'archive'}
                  onChange={() => handleFileRetentionModeChange('archive')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="archive-files" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Archive uploaded files
                </label>
              </div>

              {fileRetentionMode === 'archive' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {!archiveModeVerified ? (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="archive-pin" className="block text-sm font-medium text-gray-700 mb-2">
                          Admin PIN
                        </label>
                        <input
                          type="password"
                          id="archive-pin"
                          value={archivePin}
                          onChange={(e) => setArchivePin(e.target.value)}
                          placeholder="Enter PIN to enable archive mode"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          disabled={verifyingPin}
                        />
                      </div>
                      {archiveVerificationError && (
                        <p className="text-sm text-red-600">{archiveVerificationError}</p>
                      )}
                      <button
                        onClick={handleVerifyArchivePin}
                        disabled={verifyingPin || !archivePin.trim()}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {verifyingPin ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Archive Mode Enabled</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {datasetSource === 'custom' && importMode === 'clear' && (
          <Card title="Dataset Management" subtitle="Manage imported data" className="transition-all duration-200">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear Imported Data</h3>
                  <p className="text-sm text-gray-600">
                    This operation will permanently remove all imported business data from the database. The database schema and application configuration will remain unchanged.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  disabled={runningPipeline}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Dataset
                </button>
                {customPipelineResult && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${
                    customPipelineResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {customPipelineResult.message}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        <Card title="Pipeline Status" subtitle="Current pipeline execution status">
          {etlStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  etlStatus.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  etlStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                  etlStatus.status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {etlStatus.status.toUpperCase()}
                </span>
              </div>
              {etlStatus.current_stage && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Stage:</span>
                  <span className="text-sm text-gray-600">{etlStatus.current_stage}</span>
                </div>
              )}
              {etlStatus.records_processed !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Records Processed:</span>
                  <span className="text-sm text-gray-600">{etlStatus.records_processed}</span>
                </div>
              )}
              {etlStatus.error_message && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">{etlStatus.error_message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm">No pipeline running</p>
              </div>
            </div>
          )}
        </Card>

        <Card title="Pipeline Progress" subtitle="Track ETL pipeline progress">
          {etlStatus && etlStatus.progress !== undefined ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-600">{Math.round((etlStatus.progress || 0) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(etlStatus.progress || 0) * 100}%` }}
                />
              </div>
              {etlStatus.current_stage && (
                <p className="text-sm text-gray-600 text-center">{etlStatus.current_stage}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm">No progress data</p>
              </div>
            </div>
          )}
        </Card>

        <Card title="Execution Logs" subtitle="View pipeline execution logs">
          {etlLogs && etlLogs.logs.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {etlLogs.logs.map((log, idx) => (
                <div key={idx} className={`p-2 rounded text-xs border ${
                  log.level === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                  log.level === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                  'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium uppercase">{log.level}</span>
                    <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {log.stage && (
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mr-2">
                      {log.stage}
                    </span>
                  )}
                  <p className="mt-1">{log.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm">No logs available</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Replace Confirmation Dialog */}
      {showReplaceConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Replace Dataset</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                This will remove all existing data from the database and replace it with the new dataset. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReplaceConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReplace}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  Confirm Replace
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Clear Imported Data?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                This action will permanently remove all imported customers, products, and orders from the database. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClear}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Clear Dataset
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card title="Pipeline Summary" subtitle="Overview of pipeline operations">
        {runningPipeline ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin" />
              <p className="text-sm">Pipeline running...</p>
            </div>
          </div>
        ) : (datasetSource === 'sample' ? samplePipelineResult : customPipelineResult) ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Operation:</span>
              <span className="text-sm text-gray-900">{(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.operation || (datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.mode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                (datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.success ? 'Success' : 'Failed'}
              </span>
            </div>
            {(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.execution_time && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Execution Time:</span>
                <span className="text-sm text-gray-900">{(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.execution_time}s</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Records Processed:</span>
              <span className="text-sm text-gray-900">{(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.total_records_processed || 0}</span>
            </div>
            {(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.mode !== 'clear' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Customers Imported:</span>
                  <span className="text-sm text-gray-900">{(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.customers_inserted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Products Imported:</span>
                  <span className="text-sm text-gray-900">{(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.products_inserted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Orders Imported:</span>
                  <span className="text-sm text-gray-900">{(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.orders_inserted || 0}</span>
                </div>
                {((datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.customers_skipped || 0) > 0 || ((datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.products_skipped || 0) > 0 || ((datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.orders_skipped || 0) > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Records Skipped:</span>
                      <span className="text-sm text-gray-900">
                        {(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.customers_skipped || 0} customers, {(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.products_skipped || 0} products, {(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.orders_skipped || 0} orders
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
            {!(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.success && (datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.message && (
              <div className="pt-4 border-t border-gray-200">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">{(datasetSource === 'sample' ? samplePipelineResult : customPipelineResult)?.message}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4" />
              <p className="text-sm">No pipeline operations yet</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DataPipeline;
