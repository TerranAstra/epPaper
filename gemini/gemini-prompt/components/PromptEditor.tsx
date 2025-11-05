import React, { useState } from 'react';
import ConfigSlider from './ConfigSlider';
import type { PromptConfig } from '../types';
import { PROVIDER_MODELS, SYSTEM_INSTRUCTION_PRESETS } from '../constants';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface PromptEditorProps {
  prompt: string;
  setPrompt: (value: string) => void;
  systemInstruction: string;
  setSystemInstruction: (value: string) => void;
  config: Omit<PromptConfig, 'models'>;
  onConfigChange: (newConfig: Partial<Omit<PromptConfig, 'models'>>) => void;
  selectedModels: string[];
  onModelsChange: (modelId: string, selected: boolean) => void;
  onSubmit: () => void;
  isLoading: boolean;
  hasResponse: boolean;
  onSave: () => void;
  onCancel: () => void;
  openAIKey: string;
  setOpenAIKey: (value: string) => void;
  anthropicKey: string;
  setAnthropicKey: (value: string) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  setPrompt,
  systemInstruction,
  setSystemInstruction,
  config,
  onConfigChange,
  selectedModels,
  onModelsChange,
  onSubmit,
  isLoading,
  hasResponse,
  onSave,
  onCancel,
  openAIKey,
  setOpenAIKey,
  anthropicKey,
  setAnthropicKey,
}) => {
  const [activeTab, setActiveTab] = useState('models');
  const [selectedPresetId, setSelectedPresetId] = useState(SYSTEM_INSTRUCTION_PRESETS[0].id);

  const tabs = [
    { id: 'models', label: 'Models' },
    { id: 'instruction', label: 'Instruction' },
    { id: 'settings', label: 'Settings' },
    { id: 'prompt', label: 'Prompt' },
  ];
  
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    setSelectedPresetId(presetId);
    if (presetId === 'custom') return;

    const preset = SYSTEM_INSTRUCTION_PRESETS.find(p => p.id === presetId);
    if (preset) {
        setSystemInstruction(preset.instruction);
    }
  };
  
  const handleInstructionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInstruction = e.target.value;
    setSystemInstruction(newInstruction);
    
    const matchingPreset = SYSTEM_INSTRUCTION_PRESETS.find(p => p.instruction.trim() === newInstruction.trim());
    if (matchingPreset) {
        setSelectedPresetId(matchingPreset.id);
    } else {
        setSelectedPresetId('custom'); 
    }
  };

  return (
    <div className="flex flex-col space-y-6 bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 mb-8 lg:mb-0">
      <div className="border-b border-slate-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-grow min-h-[450px] overflow-y-auto">
        {activeTab === 'models' && (
          <div className="space-y-4">
            {PROVIDER_MODELS.map(providerInfo => (
                <details key={providerInfo.provider} className="bg-slate-900/50 border border-slate-700 rounded-lg" open>
                   <summary className="px-4 py-3 cursor-pointer font-medium text-slate-200 hover:bg-slate-800/50 transition-colors rounded-t-lg">{providerInfo.provider}</summary>
                   <div className="p-4 border-t border-slate-700 flex flex-wrap gap-x-6 gap-y-3">
                       {providerInfo.models.map(model => {
                           const modelId = `${providerInfo.provider.toLowerCase()}:${model.id}`;
                           return (
                            <div key={modelId} className="flex items-center">
                                <input
                                    id={modelId}
                                    type="checkbox"
                                    checked={selectedModels.includes(modelId)}
                                    onChange={(e) => onModelsChange(modelId, e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor={modelId} className="ml-3 block text-sm text-slate-300">
                                    {model.name}
                                </label>
                            </div>
                           );
                       })}
                   </div>
                </details>
            ))}
          </div>
        )}
        
        {activeTab === 'instruction' && (
          <div className="flex flex-col h-full space-y-4">
            <div>
              <label htmlFor="instruction-preset" className="block text-sm font-medium text-slate-300 mb-2">
                Instruction Preset
              </label>
              <select
                id="instruction-preset"
                value={selectedPresetId}
                onChange={handlePresetChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                {SYSTEM_INSTRUCTION_PRESETS.map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
                <option key="custom" value="custom">Custom</option>
              </select>
            </div>
            <div className="flex flex-col flex-grow">
              <label htmlFor="system-instruction" className="block text-sm font-medium text-slate-300 mb-2">
                System Instruction Content
              </label>
              <textarea
                id="system-instruction"
                className="w-full flex-grow bg-slate-900 border border-slate-700 rounded-md shadow-sm p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                placeholder="e.g., You are a helpful assistant."
                value={systemInstruction}
                onChange={handleInstructionChange}
              />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 pt-2">
            <div className="space-y-4">
                <ConfigSlider
                label="Temperature"
                value={config.temperature}
                onChange={(v) => onConfigChange({ temperature: v })}
                min={0}
                max={2}
                step={0.01}
                description="Controls randomness. Lower is more deterministic. (Note: OpenAI supports up to 2.0)"
                />
                <ConfigSlider
                label="Top-P"
                value={config.topP}
                onChange={(v) => onConfigChange({ topP: v })}
                min={0}
                max={1}
                step={0.01}
                description="Nucleus sampling. Considers tokens with probability mass >= topP."
                />
                <ConfigSlider
                label="Top-K"
                value={config.topK}
                onChange={(v) => onConfigChange({ topK: v })}
                min={1}
                max={100}
                step={1}
                description="Considers the top K most likely tokens. (Used by Gemini & Anthropic)"
                />
            </div>
            <div className="border-t border-slate-700"></div>
            <div className="space-y-4">
                <div>
                    <label htmlFor="openai-key" className="block text-sm font-medium text-slate-300 mb-1">
                    OpenAI API Key
                    </label>
                    <input
                    type="password"
                    id="openai-key"
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                    placeholder="sk-..."
                    className="block w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    aria-label="OpenAI API Key"
                    />
                    <p className="text-xs text-slate-500 mt-1">Required if you select an OpenAI model.</p>
                </div>
                <div>
                    <label htmlFor="anthropic-key" className="block text-sm font-medium text-slate-300 mb-1">
                    Anthropic API Key
                    </label>
                    <input
                    type="password"
                    id="anthropic-key"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="block w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    aria-label="Anthropic API Key"
                    />
                    <p className="text-xs text-slate-500 mt-1">Required if you select an Anthropic model.</p>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="flex flex-col h-full">
            <div className="flex-grow">
                 <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">
                    User Prompt
                </label>
                <textarea
                    id="prompt"
                    className="w-full h-[calc(100%-80px)] bg-slate-900 border border-slate-700 rounded-md shadow-sm p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>
            <div className="pt-4 flex items-center space-x-4">
              {isLoading ? (
                <>
                  <button
                    type="button"
                    disabled
                    className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500/50 cursor-not-allowed transition"
                  >
                    <LoadingSpinner className="w-5 h-5 mr-3" />
                    Generating...
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-red-600 text-base font-medium rounded-md shadow-sm text-slate-200 bg-red-700 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-900 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={selectedModels.length === 0}
                    className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition disabled:bg-indigo-600/50 disabled:cursor-not-allowed"
                  >
                    Run Prompt
                  </button>
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={!hasResponse}
                    className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 disabled:bg-slate-700/50 disabled:text-slate-400 disabled:cursor-not-allowed transition"
                  >
                    Save Responses
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptEditor;