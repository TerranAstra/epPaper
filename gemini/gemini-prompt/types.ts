export interface PromptConfig {
  models: string[];
  temperature: number;
  topK: number;
  topP: number;
  systemInstruction?: string;
}

export interface ResponseData {
    content: string;
    isLoading: boolean;
    error: string | null;
}

export type Responses = Record<string, ResponseData>;
