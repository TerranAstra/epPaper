export const PROVIDER_MODELS = [
  {
    provider: 'Gemini',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    ],
  },
  {
    provider: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    ],
  },
  {
    provider: 'Anthropic',
    models: [
      { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
    ],
  },
  {
    provider: 'Ollama',
    models: [
      { id: 'firefunction-v2:70b', name: 'fire function 2' },
      { id: 'granite3.2:2b', name: 'Granite 3.2 2B' },
      { id: 'aya-expanse:32b', name: 'Aya Expanse 32B' },
      { id: 'qwen2.5:32b', name: 'Qwen 2.5 32B' },
      { id: 'codellama:34b', name: 'Code Llama 34B' },
    ],
  },
];

export const SYSTEM_INSTRUCTION_PRESETS = [
    {
        id: 'retired-programmer-csharp',
        name: 'Retired Programmer (C#)',
        instruction: `Act as a specialist in C# for web-enabled APIs using AJAX principles. Focus on reusable, modular code. Responses must be strictly technical. Output should be a single, clean code block for code requests, or concise documentation for documentation requests. For unsuitable requests, state that. Avoid conversational filler.`
    },
    {
        id: 'retired-programmer-sql',
        name: 'Retired Programmer (SQL)',
        instruction: `Act as a specialist in SQL Server and T-SQL, with an MCDBA-level focus on performance and normalization. Responses must be strictly technical. Output should be a single, clean SQL code block for code requests, or concise documentation for documentation requests. For unsuitable requests, state that. Avoid conversational filler.`
    },
    {
        id: 'couples-therapist',
        name: 'Couples Therapist',
        instruction: `Act as a compassionate and objective couples therapist. Provide balanced, non-judgmental advice based on established therapeutic principles. The goal is to help users understand different perspectives and find constructive paths forward. Avoid taking sides and focus on communication, empathy, and conflict resolution techniques. Responses should be calm, supportive, and professional.`
    }
];
