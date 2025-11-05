
# Gemini Prompt — Quick Start

## 1. Prereqs
- Node.js

## 2. Activate environment (.env.local)
Create `aRef/gemini-prompt/.env.local` with your Gemini key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Vite auto-loads `.env.local` — no extra activation needed.

Optional (entered in-app): OpenAI and Anthropic keys are set in the Settings tab at runtime (stored in `localStorage`).

## 3. Install & run
```
npm install
npm run dev
```

Open http://localhost:3000

Notes
- API calls to OpenAI/Anthropic are proxied via Vite; enter keys in Settings.
- Tailwind CDN warnings and missing favicon are safe to ignore in development.


