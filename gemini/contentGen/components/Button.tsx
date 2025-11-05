
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  disabled,
  variant = 'primary',
  ...props
}) => {
  const baseStyles = "px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-150 ease-in-out flex items-center justify-center";
  
  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles = `text-white ${disabled ? 'bg-slate-500 cursor-not-allowed' : 'hover:opacity-90'}`;
  } else { // secondary
    variantStyles = `bg-slate-600 text-slate-100 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-500'} focus:ring-slate-400`;
  }

  return (
    <button
      {...props}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
};
    