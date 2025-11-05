
import React from 'react';

interface GeneratedImageDisplayProps {
  src: string;
  alt: string;
}

export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ src, alt }) => {
  return (
    <div className="mt-6 p-4 bg-slate-700 rounded-lg shadow-inner">
      <h3 className="text-lg font-medium text-slate-200 mb-3">Generated Image:</h3>
      <img 
        src={src} 
        alt={alt || "Generated image"} 
        className="rounded-md w-full h-auto object-contain max-h-[400px] border-2 border-slate-600" 
      />
    </div>
  );
};
    