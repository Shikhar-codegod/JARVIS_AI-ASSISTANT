import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function localApi(env) {
  return {
    name: "local-ollama-api",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (request, response) => {
        if (request.method !== "POST") {
          response.statusCode = 405;
          response.end(JSON.stringify({ error: "Method not allowed." }));
          return;
        }

        let body = "";
        for await (const chunk of request) body += chunk;
        const prompt = JSON.parse(body).prompt?.trim();
        const normalizedPrompt = prompt?.toLowerCase().replace(/[?!.,]/g, "").trim();
        if (/\bwhat(?: is|'s|s) your name\b/.test(normalizedPrompt)) {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ response: "JARVIS" }));
          return;
        }
        if (/\bwho (?:developed|created) you\b/.test(normalizedPrompt)) {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ response: "Shikhar Goyal" }));
          return;
        }
        const baseUrl = env.OLLAMA_BASE_URL?.replace(/\/$/, "");
        const model = env.OLLAMA_MODEL || "llama3.1";
        if (!baseUrl) {
          response.statusCode = 500;
          response.end(JSON.stringify({ error: "Set OLLAMA_BASE_URL in web/.env.local." }));
          return;
        }

        try {
          const ollamaResponse = await fetch(`${baseUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model, prompt: `Answer briefly in 1–2 sentences: ${prompt}`, stream: false }),
          });
          const data = await ollamaResponse.json();
          response.statusCode = ollamaResponse.ok ? 200 : 502;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify(ollamaResponse.ok ? { response: data.response } : { error: data.error }));
        } catch {
          response.statusCode = 502;
          response.end(JSON.stringify({ error: "Could not connect to the remote Ollama server." }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(loadEnv(mode, ".", ""))],
  envDir: ".",
  env: {
    ...loadEnv(mode, ".", ""),
  },
}));
