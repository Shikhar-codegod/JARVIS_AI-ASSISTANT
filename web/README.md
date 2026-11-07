# JARVIS web app

This is an additional web interface; `main.py`, `client.py`, and the existing desktop behavior are unchanged.

## Vercel deployment

1. Import the project into Vercel and set **Root Directory** to `web`.
2. Add these Vercel environment variables:
   - `OLLAMA_BASE_URL`: the HTTPS URL of the remote Ollama server (without `/api`) if using Ollama.
   - `OLLAMA_MODEL`: `llama3.1` (or another model installed on that server).
   - `GROQ_API_KEY`: your secret API key from the Groq Console.
   - `GROQ_MODEL`: `llama-3.3-70b-versatile` (or another model available in your Groq account).
3. Deploy.

The provider selector uses `/api/chat` for Ollama and `/api/groq` for Groq. Existing Ollama behavior remains available; Groq is an additional option.

## Local frontend

```powershell
cd web
npm install
npm run dev
```

For local chat, copy `.env.example` to `.env.local` and configure the provider(s) you want to use. Never expose `GROQ_API_KEY` in frontend code or commit `.env.local`.

The browser voice controls use the Web Speech API. Text-to-speech and microphone support depend on the browser and its permissions.
