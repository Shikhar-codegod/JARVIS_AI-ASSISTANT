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

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  if (!apiKey) return response.status(500).json({ error: "GROQ_API_KEY is not configured." });

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: `Answer briefly in 1–2 sentences: ${prompt}` }],
        stream: false,
      }),
    });
    const responseText = await groqResponse.text();
    let data = {};
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Groq returned invalid JSON:", error);
        return response.status(502).json({
          error: `Groq returned an invalid response (HTTP ${groqResponse.status}).`,
        });
      }
    }
    if (!groqResponse.ok) {
      return response.status(502).json({ error: data.error?.message || "Groq request failed." });
    }
    if (!data.choices?.[0]?.message?.content) {
      return response.status(502).json({
        error: `Groq returned an empty response (HTTP ${groqResponse.status}).`,
      });
    }
    return response.status(200).json({
      response: data.choices[0].message.content,
    });
  } catch (error) {
    console.error("Groq request failed:", error);
    return response.status(502).json({ error: "Could not connect to the Groq API." });
  }
}
