import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import HeaderActions from '../components/ui/HeaderActions';
import Phase2Dialog, { Phase2FeatureConfig } from '../components/ui/Phase2Dialog';
import { Download, FileText, Calendar, TrendingUp, Package, Users, DollarSign } from 'lucide-react';

interface Report {
  id: number;
  name: string;
  description: string;
  type: string;
  lastGenerated: string;
  icon: React.ReactNode;
}

const Reports: React.FC = () => {
  const [showReportDialog, setShowReportDialog] = useState(false);

  const reportConfig: Phase2FeatureConfig = {
    title: 'Report Generation',
    description: 'Report generation will be available in Phase 2 of the project.',
    plannedFeatures: [
      'CSV Export',
      'Excel Export',
      'PDF Reports',
      'Scheduled Reports',
      'Custom Date Range Reports',
      'Automated Report Delivery',
    ],
    icon: 'report',
    buttonText: 'Close',
  };

  const downloadHistory = [
    { id: 1, name: 'Sales Report - Monthly', date: '2024-01-15', format: 'CSV' },
    { id: 2, name: 'Product Performance Report', date: '2024-01-14', format: 'PDF' },
    { id: 3, name: 'Customer Analytics Report', date: '2024-01-13', format: 'CSV' },
    { id: 4, name: 'Revenue by Region Report', date: '2024-01-12', format: 'CSV' },
  ];

  const reports: Report[] = [
    {
      id: 1,
      name: 'Sales Report',
      description: 'Comprehensive sales data with trends and analysis',
      type: 'Sales',
      lastGenerated: '2024-01-15',
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      id: 2,
      name: 'Product Performance Report',
      description: 'Product metrics, inventory, and performance data',
      type: 'Products',
      lastGenerated: '2024-01-14',
      icon: <Package className="w-6 h-6" />,
    },
    {
      id: 3,
      name: 'Customer Analytics Report',
      description: 'Customer behavior, demographics, and purchase patterns',
      type: 'Customers',
      lastGenerated: '2024-01-13',
      icon: <Users className="w-6 h-6" />,
    },
    {
      id: 4,
      name: 'Revenue Report',
      description: 'Revenue breakdown by category, region, and time period',
      type: 'Revenue',
      lastGenerated: '2024-01-12',
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      id: 5,
      name: 'Monthly Summary Report',
      description: 'Monthly overview of all key metrics and KPIs',
      type: 'Summary',
      lastGenerated: '2024-01-10',
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: 6,
      name: 'Custom Date Range Report',
      description: 'Generate reports for specific date ranges',
      type: 'Custom',
      lastGenerated: 'Never',
      icon: <Calendar className="w-6 h-6" />,
    },
  ];

  const handleGenerateReport = (_reportId: number) => {
    setShowReportDialog(true);
  };

  const handleExportCSV = () => {
    setShowReportDialog(true);
  };

  const handleExportPDF = () => {
    setShowReportDialog(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Generate and download analytics reports</p>
        </div>
        <HeaderActions
          actions={[
            {
              type: 'export',
              icon: <Download className="w-4 h-4" />,
              label: 'Export CSV',
              onClick: handleExportCSV,
            },
            {
              type: 'export',
              icon: <Download className="w-4 h-4" />,
              label: 'Export PDF',
              onClick: handleExportPDF,
            },
          ]}
          className="w-full sm:w-auto"
        />
      </div>

      <Card title="Available Reports" subtitle="Select a report to generate">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleGenerateReport(report.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {report.icon}
                </div>
                <span className="text-xs text-gray-500">Last: {report.lastGenerated}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <Button variant="primary" size="sm" className="w-full">
                Generate Report
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Download History" subtitle="Recently downloaded reports">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Download Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {downloadHistory.map((download) => (
                <tr key={download.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {download.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {download.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {download.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                      Download Again
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Report Settings" subtitle="Configure report generation preferences">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto-generate Monthly Reports</h4>
              <p className="text-sm text-gray-500 mt-1">Automatically generate reports at the end of each month</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500 mt-1">Receive email when reports are ready for download</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Include Charts in Reports</h4>
              <p className="text-sm text-gray-500 mt-1">Add visual charts and graphs to generated reports</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </Card>

      <Phase2Dialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        config={reportConfig}
      />
    </div>
  );
};

export default Reports;
