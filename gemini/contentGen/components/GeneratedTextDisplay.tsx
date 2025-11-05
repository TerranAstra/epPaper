
import React from 'react';

interface GeneratedTextDisplayProps {
  text: string;
}

export const GeneratedTextDisplay: React.FC<GeneratedTextDisplayProps> = ({ text }) => {
  return (
    <div className="mt-6 p-4 bg-slate-700 rounded-lg shadow-inner max-h-96 overflow-y-auto">
      <h3 className="text-lg font-medium text-slate-200 mb-3">Generated Story:</h3>
      <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
        {text}
      </p>
    </div>
  );
};
    