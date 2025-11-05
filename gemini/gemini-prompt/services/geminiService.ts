import { GoogleGenAI } from "@google/genai";

// --- Gemini Configuration ---
let ai: GoogleGenAI | null = null;
// @ts-ignore - Vite defines this at build time
if (typeof process !== 'undefined' && process.env?.API_KEY) {
  // @ts-ignore
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
  console.warn("API_KEY for Gemini not set, Gemini models will not be available.");
}

// --- Unified Error Handling ---
class LLMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMError';
  }
}

// --- Internal Provider Implementations ---

const _runGeminiPrompt = async (prompt: string, model: string, systemInstruction: string | undefined, temperature: number, topK: number, topP: number, signal: AbortSignal): Promise<string> => {
  if (!ai) {
    throw new LLMError("Gemini API key is not configured.");
  }
  try {
     const abortPromise = new Promise<never>((_, reject) => {
      signal.addEventListener('abort', () => {
        const error = new Error('Generation cancelled by user.');
        error.name = 'AbortError';
        reject(error);
      });
    });

    const generationPromise = ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature,
        topK,
        topP,
      },
    });

    const response = await Promise.race([generationPromise, abortPromise]);
    
    return response.text;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      throw new LLMError(error.message);
    }
    throw new LLMError("An unknown error occurred with the Gemini API.");
  }
};

const _runOpenAIPrompt = async (prompt: string, model: string, systemInstruction: string | undefined, temperature: number, topP: number, signal: AbortSignal, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new LLMError("OpenAI API Key not provided. Please enter it in the Settings tab.");
  }
  
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('/api/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: temperature,
      top_p: topP,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
        const errorData = JSON.parse(errorText);
        throw new LLMError(errorData.error?.message || `HTTP error! status: ${response.status}`);
    } catch(e) {
        throw new LLMError(errorText || `HTTP error! status: ${response.status}`);
    }
  }
  const data = await response.json();
  return data.choices[0]?.message?.content || "";
};

const _runAnthropicPrompt = async (prompt: string, model: string, systemInstruction: string | undefined, temperature: number, topK: number, topP: number, signal: AbortSignal, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new LLMError("Anthropic API Key not provided. Please enter it in the Settings tab.");
  }

  const response = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: model,
      system: systemInstruction,
      messages: [{ role: 'user', content: prompt }],
      temperature: temperature,
      top_k: topK,
      top_p: topP,
      max_tokens: 4096,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
        const errorData = JSON.parse(errorText);
        throw new LLMError(errorData.error?.message || `HTTP error! status: ${response.status}`);
    } catch(e) {
        throw new LLMError(errorText || `HTTP error! status: ${response.status}`);
    }
  }

  const data = await response.json();
  return data.content[0]?.text || "";
};

const _runOllamaPrompt = async (prompt: string, model: string, systemInstruction: string | undefined, temperature: number, topP: number, signal: AbortSignal): Promise<string> => {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        system: systemInstruction,
        stream: false,
        options: {
          temperature: temperature,
          top_p: topP,
        }
      }),
      signal,
    });

    if (!response.ok) {
       const errorText = await response.text();
       try {
         const errorJson = JSON.parse(errorText);
         if (errorJson?.error) {
           throw new LLMError(`Ollama API Error: ${errorJson.error}`);
         }
       } catch (e) {
         // Fallback to raw text
       }
       throw new LLMError(errorText || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "";
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    if (error instanceof LLMError) {
      throw error;
    }
    console.error("Error calling Ollama API:", error);
    throw new LLMError("Failed to connect to Ollama server at http://localhost:11434. Is Ollama running and have you configured CORS if necessary? \n" + error) ;
  }
};


// --- Public Orchestrator Function ---
interface ModelPromptConfig {
    prompt: string;
    modelId: string;
    systemInstruction: string | undefined;
    temperature: number;
    topK: number;
    topP: number;
    signal: AbortSignal;
    openAIKey: string;
    anthropicKey: string;
}

export const runModelPrompt = async (config: ModelPromptConfig): Promise<string> => {
    const { 
        prompt, modelId, systemInstruction, temperature, 
        topK, topP, signal, openAIKey, anthropicKey 
    } = config;

    const [provider, ...modelParts] = modelId.split(':');
    const model = modelParts.join(':');

    console.log(`--- [Service Wrapper] Calling provider: ${provider}, model: ${model} ---`);
    console.log(`[Service Wrapper] OpenAI Key Provided: ${!!openAIKey}, Anthropic Key Provided: ${!!anthropicKey}`);

    switch(provider) {
        case 'gemini':
            return _runGeminiPrompt(prompt, model, systemInstruction, temperature, topK, topP, signal);
        case 'openai':
            return _runOpenAIPrompt(prompt, model, systemInstruction, temperature, topP, signal, openAIKey);
        case 'anthropic':
            return _runAnthropicPrompt(prompt, model, systemInstruction, temperature, topK, topP, signal, anthropicKey);
        case 'ollama':
            return _runOllamaPrompt(prompt, model, systemInstruction, temperature, topP, signal);
        default:
            throw new LLMError(`Unknown provider: ${provider}`);
    }
};

export const getSynopsis = async (prompt: string): Promise<string> => {
  if (!ai) {
    console.warn("Cannot generate synopsis because Gemini API key is not configured.");
    return "untitled-response";
  }
  try {
    const systemInstruction = `You are an expert summarizer. Your task is to create a three-word, lowercase, hyphenated summary of the given text. This summary will be used as part of a filename. It should not contain any special characters other than hyphens. Example response for "a story about a brave knight": brave-knight-story`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize this text: "${prompt}"`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      },
    });

    const synopsis = response.text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    return synopsis || 'untitled-response';
  } catch (error) {
    console.error("Error generating synopsis:", error);
    return 'untitled-response';
  }
};