import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ETLStatus, ETLLogsResponse } from '../services/api';

interface ETLContextType {
  runningPipeline: boolean;
  setRunningPipeline: (running: boolean) => void;
  etlStatus: ETLStatus | null;
  setEtlStatus: (status: ETLStatus | null) => void;
  etlLogs: ETLLogsResponse | null;
  setEtlLogs: (logs: ETLLogsResponse | null) => void;
  resetPipelineState: () => void;
}

const ETLContext = createContext<ETLContextType | undefined>(undefined);

export const ETLProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [etlStatus, setEtlStatus] = useState<ETLStatus | null>(null);
  const [etlLogs, setEtlLogs] = useState<ETLLogsResponse | null>(null);

  const resetPipelineState = () => {
    setRunningPipeline(false);
    setEtlStatus(null);
    setEtlLogs(null);
  };

  return (
    <ETLContext.Provider
      value={{
        runningPipeline,
        setRunningPipeline,
        etlStatus,
        setEtlStatus,
        etlLogs,
        setEtlLogs,
        resetPipelineState,
      }}
    >
      {children}
    </ETLContext.Provider>
  );
};

export const useETL = () => {
  const context = useContext(ETLContext);
  if (context === undefined) {
    throw new Error('useETL must be used within an ETLProvider');
  }
  return context;
};
