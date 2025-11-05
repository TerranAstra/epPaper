
import React from 'react';

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  isTextArea?: boolean;
  rows?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  isTextArea = true, // Default to textarea for prompts
  rows = 3,
}) => {
  const commonProps = {
    id: id,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    className: `w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-slate-100 placeholder-slate-400 disabled:opacity-50 resize-none`,
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
        {label}
      </label>
      {isTextArea ? (
        <textarea {...commonProps} rows={rows}></textarea>
      ) : (
        <input type="text" {...commonProps} />
      )}
    </div>
  );
};
    