
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // e.g., 'text-blue-500'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-white' }) => {
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'w-5 h-5 border-2';
      break;
    case 'lg':
      sizeClasses = 'w-12 h-12 border-4';
      break;
    case 'md':
    default:
      sizeClasses = 'w-8 h-8 border-4';
      break;
  }

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses} ${color} border-t-transparent`}
        style={{ borderTopColor: 'transparent' }} // Tailwind JIT might need explicit style for this
      ></div>
    </div>
  );
};
    