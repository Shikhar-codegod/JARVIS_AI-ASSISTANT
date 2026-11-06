export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  const prompt = typeof request.body?.prompt === "string" ? request.body.prompt.trim() : "";
  if (!prompt || prompt.length > 4000) return response.status(400).json({ error: "Prompt must be between 1 and 4000 characters." });
  const normalizedPrompt = prompt.toLowerCase().replace(/[?!.,]/g, "").trim();
  if (/\bwhat(?: is|'s|s) your name\b/.test(normalizedPrompt)) {
    return response.status(200).json({ response: "JARVIS" });
  }
  if (/\bwho (?:developed|created) you\b/.test(normalizedPrompt)) {
    return response.status(200).json({ response: "Shikhar Goyal" });
  }

  const baseUrl = process.env.OLLAMA_BASE_URL?.replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "llama3.1";
  if (!baseUrl) return response.status(500).json({ error: "OLLAMA_BASE_URL is not configured." });

  try {
    const ollamaResponse = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: `Answer briefly in 1–2 sentences: ${prompt}`, stream: false }),
    });
    const data = await ollamaResponse.json();
    if (!ollamaResponse.ok) return response.status(502).json({ error: data.error || "Ollama request failed." });
    return response.status(200).json({ response: data.response || "I did not receive a response." });
  } catch {
    return response.status(502).json({ error: "Could not connect to the remote Ollama server." });
  }
}
