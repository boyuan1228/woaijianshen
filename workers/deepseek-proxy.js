const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!env.DEEPSEEK_API_KEY) return json({ error: "DEEPSEEK_API_KEY is not configured" }, 500);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const question = String(payload.question || "").trim().slice(0, 1200);
    const language = payload.language === "en" ? "English" : "Chinese";
    if (!question) return json({ error: "Missing question" }, 400);

    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-v4-pro",
        thinking: { type: "enabled" },
        reasoning_effort: "high",
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You answer as a concise training knowledge assistant. Give general education only, not diagnosis or medical treatment. Mention when professional assessment is needed. Avoid inventing citations.",
          },
          {
            role: "user",
            content: `Answer in ${language}. Topic: ${question}`,
          },
        ],
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return json({ error: "DeepSeek request failed", detail: data }, upstream.status);

    return json({
      answer: data?.choices?.[0]?.message?.content || "",
      model: data?.model || "deepseek-v4-pro",
    });
  },
};
