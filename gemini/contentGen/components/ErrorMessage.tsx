
import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <div className={`p-4 bg-red-900 border border-red-700 text-red-100 rounded-lg ${className}`}>
      <p className="font-semibold">Error:</p>
      <p className="text-sm whitespace-pre-wrap">{message}</p>
    </div>
  );
};
    