import React, { useState, useEffect, useMemo } from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';
import type { Responses } from '../types';

interface ResponseViewerProps {
  responses: Responses;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ responses }) => {
  const responseKeys = useMemo(() => Object.keys(responses), [responses]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    if (responseKeys.length > 0 && (!activeTab || !responseKeys.includes(activeTab))) {
      setActiveTab(responseKeys[0]);
    } else if (responseKeys.length === 0) {
      setActiveTab(null);
    }
  }, [responseKeys, activeTab]);

  const getModelDisplayName = (modelId: string) => {
    const parts = modelId.split(':');
    if (parts.length > 1) {
        const provider = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const model = parts[1];
        return `${provider} (${model})`;
    }
    return modelId;
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 flex flex-col h-full max-h-[70vh] lg:max-h-none overflow-hidden">
      <div className="flex-shrink-0 border-b border-slate-700">
        <nav className="-mb-px flex space-x-4 px-6" aria-label="Tabs">
          {responseKeys.length > 0 ? responseKeys.map((modelId) => (
            <button
              key={modelId}
              onClick={() => setActiveTab(modelId)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === modelId
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
              }`}
              aria-current={activeTab === modelId ? 'page' : undefined}
            >
              {getModelDisplayName(modelId)}
            </button>
          )) : (
             <div className="py-3 px-1 text-sm text-slate-500">Response</div>
          )}
        </nav>
      </div>
      <div className="flex-grow bg-slate-900 rounded-b-md p-4 overflow-y-auto min-h-[200px]">
        {responseKeys.length === 0 && (
             <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Select models and run a prompt to see responses.</p>
            </div>
        )}
        {activeTab && responses[activeTab] && (() => {
          const { isLoading, error, content } = responses[activeTab];
          if (isLoading) {
            return (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <LoadingSpinner className="w-10 h-10 mx-auto text-indigo-400" />
                  <p className="mt-2 text-slate-400">Generating response...</p>
                </div>
              </div>
            );
          }
          if (error) {
            return (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md h-full">
                <p className="font-bold">Error</p>
                <p className="text-sm whitespace-pre-wrap">{error}</p>
              </div>
            );
          }
          if (content) {
            return (
              <pre className="whitespace-pre-wrap text-slate-300 font-sans text-base leading-relaxed">{content}</pre>
            );
          }
           return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Waiting for response...</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ResponseViewer;
