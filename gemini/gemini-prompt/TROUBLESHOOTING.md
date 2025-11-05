# API Connection Troubleshooting Guide

## Current Status
- ✅ **Gemini**: Working (API key in .env)
- ✅ **Ollama**: Working (localhost:11434)
- ⚠️ **OpenAI**: Needs API key in Settings tab
- ⚠️ **Anthropic**: Fixed CORS header issue

## Setup Instructions

### 1. Restart the Development Server
After the proxy configuration changes, you must restart:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Enter API Keys in the Application
1. Open the app at http://localhost:3000
2. Click on the **Settings** tab in the UI
3. Enter your API keys:
   - **OpenAI API Key**: starts with `sk-proj-` or `sk-`
   - **Anthropic API Key**: starts with `sk-ant-`
4. Keys are saved in localStorage automatically

### 3. Test Your API Keys
Open `test-api-keys.html` in your browser to test each API individually:
```bash
# Windows
start chrome "file:///C:/GitHub/TerranAstra/frank/aRef/gemini-prompt/test-api-keys.html"
```

## Common Issues & Solutions

### Error: "OpenAI Key Provided: false"
**Problem**: OpenAI API key not entered or not saved  
**Solution**: Enter your OpenAI key in the Settings tab of the app

### Error: "401 Unauthorized" from Anthropic
**Problem**: Invalid API key or missing CORS header  
**Solution**: Already fixed with `anthropic-dangerous-direct-browser-access` header

### Error: "404 Not Found" for /api/openai or /api/anthropic
**Problem**: Vite proxy not configured  
**Solution**: Already fixed in vite.config.ts - just restart the server

### Error: "CORS policy" errors
**Problem**: Direct browser requests being blocked  
**Solution**: The Vite proxy configuration handles this now

## Security Warnings (Non-Critical)

These warnings are normal and don't affect functionality:
- ⚠️ **Tailwind CDN warning**: Not an issue for development
- ⚠️ **React DevTools suggestion**: Optional development tool
- ⚠️ **Missing favicon**: Cosmetic issue only

## API Key Security Best Practices

⚠️ **Important**: Your current setup stores API keys in the browser, which is NOT secure for production!

### For Development (Current Setup)
- Keys stored in localStorage
- Direct browser API calls through Vite proxy
- Acceptable for local testing only

### For Production (Recommended)
1. Create a backend API server
2. Store keys in environment variables on the server
3. Proxy all AI API calls through your backend
4. Implement user authentication
5. Never expose API keys to the frontend

## Quick Verification Checklist

- [ ] Vite dev server restarted after config changes
- [ ] API keys entered in Settings tab
- [ ] localStorage has 'openai_api_key' and 'anthropic_api_key'
- [ ] Network tab shows requests going to `/api/openai` or `/api/anthropic`
- [ ] Response status is 200 (not 404 or 401)

## Still Having Issues?

1. Clear browser cache and localStorage:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. Check the browser console for specific error messages

3. Verify API keys are valid:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/settings/keys

4. Ensure Ollama is running if testing local models:
   ```bash
   ollama serve
   ```
