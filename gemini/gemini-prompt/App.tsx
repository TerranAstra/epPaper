import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import PromptEditor from './components/PromptEditor';
import ResponseViewer from './components/ResponseViewer';
import { runModelPrompt, getSynopsis } from './services/geminiService';
import type { PromptConfig, Responses, ResponseData } from './types';
import { SYSTEM_INSTRUCTION_PRESETS } from './constants';

const defaultSystemInstruction = SYSTEM_INSTRUCTION_PRESETS[0].instruction;

const defaultPrompt = 'Provide an example of a C# web-enabled API for a simple to-do list application, using AJAX principles for client-side interaction.';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(defaultPrompt);
  const [systemInstruction, setSystemInstruction] = useState<string>(defaultSystemInstruction);
  const [config, setConfig] = useState<Omit<PromptConfig, 'models'>>({
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
  });
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini:gemini-2.5-flash']);
  
  const [responses, setResponses] = useState<Responses>({});
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const [openAIKey, setOpenAIKey] = useState<string>(() => localStorage.getItem('openai_api_key') || '');
  const [anthropicKey, setAnthropicKey] = useState<string>(() => localStorage.getItem('anthropic_api_key') || '');
  
  useEffect(() => {
    localStorage.setItem('openai_api_key', openAIKey);
  }, [openAIKey]);
  
  useEffect(() => {
    localStorage.setItem('anthropic_api_key', anthropicKey);
  }, [anthropicKey]);

  const isLoading = Object.values(responses).some((r: ResponseData) => r.isLoading);

  const handleConfigChange = useCallback((newConfig: Partial<Omit<PromptConfig, 'models'>>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const handleModelsChange = useCallback((modelId: string, isSelected: boolean) => {
    setSelectedModels(prev => {
      const newModels = new Set(prev);
      if (isSelected) {
        newModels.add(modelId);
      } else {
        newModels.delete(modelId);
      }
      return Array.from(newModels);
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || selectedModels.length === 0) return;
    
    const controller = new AbortController();
    setAbortController(controller);
    
    const initialResponses: Responses = {};
    selectedModels.forEach(modelId => {
        initialResponses[modelId] = { content: '', isLoading: true, error: null };
    });
    setResponses(initialResponses);

    const fullSystemInstruction = systemInstruction.trim() ? systemInstruction.trim() : undefined;

    selectedModels.forEach(async (modelId) => {
      try {
        const result = await runModelPrompt({
          prompt,
          modelId,
          systemInstruction: fullSystemInstruction,
          temperature: config.temperature,
          topK: config.topK,
          topP: config.topP,
          signal: controller.signal,
          openAIKey,
          anthropicKey,
        });
        
        setResponses(prev => ({
          ...prev,
          [modelId]: { content: result, isLoading: false, error: null }
        }));

      } catch (error) {
         if (error instanceof Error && error.name === 'AbortError') {
            console.log(`Request for ${modelId} was cancelled.`);
            setResponses(prev => ({
                ...prev,
                [modelId]: { ...prev[modelId], isLoading: false, error: 'Generation cancelled by user.' }
            }));
            return;
        }
        console.error(`Error with model ${modelId}:`, error);
        setResponses(prev => ({
          ...prev,
          [modelId]: { content: '', isLoading: false, error: error instanceof Error ? error.message : 'An unknown error occurred.' }
        }));
      }
    });

  }, [prompt, config, systemInstruction, selectedModels, openAIKey, anthropicKey]);

  const handleCancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  }, [abortController]);

  const handleSave = useCallback(async () => {
    if (Object.keys(responses).length === 0) return;

    const synopsis = await getSynopsis(prompt);
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}`;
    const filename = `${dateStr}_${synopsis}.html`;

    const responsesToSave = Object.entries(responses).reduce((acc, [modelId, data]: [string, ResponseData]) => {
        if (data.content) {
            acc[modelId] = data.content;
        }
        return acc;
    }, {} as Record<string, string>);

    const saveData = {
        models: selectedModels,
        prompt: prompt,
        systemInstruction: systemInstruction,
        responses: responsesToSave
    };

    const jsonString = JSON.stringify(saveData, null, 2);

    const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Gemini Response - ${synopsis}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;background-color:#0f172a;color:#e2e8f0;padding:1rem 2rem}h1{color:#cbd5e1}pre{white-space:pre-wrap;word-wrap:break-word;background-color:#1e293b;padding:1.5rem;border-radius:8px;border:1px solid #334155;font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,Courier,monospace;font-size:.9rem}code{display:block}</style></head><body><h1>Prompt & Responses</h1><pre><code>${jsonString.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre></body></html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [responses, prompt, systemInstruction, selectedModels]);

  const hasResponseContent = Object.values(responses).some((r: ResponseData) => r.content);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 lg:h-[calc(100vh-9rem)]">
          <PromptEditor
            prompt={prompt}
            setPrompt={setPrompt}
            systemInstruction={systemInstruction}
            setSystemInstruction={setSystemInstruction}
            config={config}
            onConfigChange={handleConfigChange}
            selectedModels={selectedModels}
            onModelsChange={handleModelsChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            hasResponse={hasResponseContent}
            onSave={handleSave}
            onCancel={handleCancel}
            openAIKey={openAIKey}
            setOpenAIKey={setOpenAIKey}
            anthropicKey={anthropicKey}
            setAnthropicKey={setAnthropicKey}
          />
          <ResponseViewer responses={responses} />
        </div>
      </main>
    </div>
  );
};

export default App;