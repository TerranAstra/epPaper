
import React from 'react';

interface ConfigSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  description: string;
}

const ConfigSlider: React.FC<ConfigSliderProps> = ({ label, value, onChange, min, max, step, description }) => {
  return (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-300">{label}</label>
            <span className="text-sm font-mono bg-slate-700 text-slate-200 px-2 py-0.5 rounded">{value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  );
};

export default ConfigSlider;
