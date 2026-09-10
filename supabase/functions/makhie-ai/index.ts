// Makhie AI proxy — keeps the model API key server-side and gives every
// Makhie visitor free AI features via Google Gemini's free tier.
//
// Deploy (one time, from the makhie/ folder):
//   1. supabase login
//   2. supabase functions deploy makhie-ai --project-ref tlpcyfpsqcchhrpymehu
//   3. supabase secrets set GEMINI_API_KEY=<your key from aistudio.google.com/apikey> \
//        --project-ref tlpcyfpsqcchhrpymehu
//
// The site probes this function on load; AI buttons appear automatically
// once it responds, and stay hidden while it doesn't.

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

function json(o: unknown, status = 200): Response {
  return new Response(JSON.stringify(o), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { system, prompt, ping } = await req.json();
    if (ping) return json({ ok: true });

    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) return json({ error: "GEMINI_API_KEY secret not set" }, 500);

    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + key,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: String(system || "You are Makhie, a practical assistant for South African entrepreneurs. Be brief, concrete and honest.") }] },
          contents: [{ role: "user", parts: [{ text: String(prompt || "").slice(0, 12000) }] }],
          generationConfig: { maxOutputTokens: 900, temperature: 0.4 },
        }),
      },
    );
    const j = await r.json();
    const text = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    if (!text) return json({ error: j?.error?.message || "no output" }, 502);
    return json({ text });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
