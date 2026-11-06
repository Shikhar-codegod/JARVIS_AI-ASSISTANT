# JARVIS web app

This is an additional web interface; `main.py`, `client.py`, and the existing desktop behavior are unchanged.

## Vercel deployment

1. Import the project into Vercel and set **Root Directory** to `web`.
2. Add these Vercel environment variables:
   - `OLLAMA_BASE_URL`: the HTTPS URL of the remote Ollama server (without `/api`).
   - `OLLAMA_MODEL`: `llama3.1` (or another model installed on that server).
3. Deploy.

Vercel hosts the React frontend and `/api/chat` proxy. The Ollama model must stay running on a reachable server; Vercel does not run Ollama itself.

## Local frontend

```powershell
cd web
npm install
npm run dev
```

For local chat, copy `.env.example` to `.env.local` and set `OLLAMA_BASE_URL` to the remote Ollama server.

The browser voice controls use the Web Speech API. Text-to-speech and microphone support depend on the browser and its permissions.
