// GET PAID IN CRYPTO — inbound webhook for the real payment provider.
// NOT deployed while the feature runs in mock mode. When a provider is chosen:
//
//   supabase functions deploy makhie-crypto-webhook --project-ref tlpcyfpsqcchhrpymehu
//   supabase secrets set CRYPTO_PROVIDER=<name> CRYPTO_API_KEY=... CRYPTO_API_SECRET=... \
//     CRYPTO_WEBHOOK_SECRET=... CRYPTO_NETWORK=<e.g. polygon> CRYPTO_ASSET=USDC \
//     SERVICE_ROLE_KEY=<service role key> --project-ref tlpcyfpsqcchhrpymehu
//
// Contract enforced here, matching the mock RPC's state machine exactly:
//   1. verify the provider's HMAC signature (raw body, constant-time compare)
//   2. identify the session by provider_tx_id / metadata
//   3. validate amount + asset + network against the session
//   4. refuse duplicates (webhook_events ledger)
//   5. PENDING -> PROCESSING on detection; PROCESSING -> COMPLETED only after
//      the configured confirmation count; anything after expiry -> EXPIRED
//   6. store tx hash + timestamps
// The client is never trusted for completion; only this endpoint moves a
// session to COMPLETED in real mode.

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, x-signature" };
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, "content-type": "application/json" } });

async function hmacValid(secret: string, body: string, signature: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const secret = Deno.env.get("CRYPTO_WEBHOOK_SECRET");
  const srk = Deno.env.get("SERVICE_ROLE_KEY");
  if (!secret || !srk) return json({ error: "provider not configured" }, 503);

  const raw = await req.text();
  const sig = req.headers.get("x-signature") ?? "";
  if (!(await hmacValid(secret, raw, sig))) return json({ error: "bad signature" }, 401);

  // Adapt this parse to the chosen provider's payload shape.
  let ev: { session_id?: string; provider_tx_id?: string; event?: string;
    amount?: string; asset?: string; network?: string; tx_hash?: string };
  try { ev = JSON.parse(raw); } catch { return json({ error: "bad payload" }, 400); }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, srk);
  const { data: s } = await db.from("makhie_crypto_sessions")
    .select("*").eq("id", ev.session_id).single();
  if (!s) return json({ error: "unknown session" }, 404);

  // amount / asset / network validation
  if (ev.asset !== s.crypto_asset) return json({ error: "asset mismatch" }, 422);
  if (ev.network && ev.network !== (Deno.env.get("CRYPTO_NETWORK") ?? ev.network))
    return json({ error: "network mismatch" }, 422);
  if (ev.amount && Math.abs(Number(ev.amount) - Number(s.crypto_amount)) > 0.000001)
    return json({ error: "amount mismatch" }, 422);

  // idempotency
  const evId = `${ev.event}:${ev.provider_tx_id ?? ev.session_id}`;
  if ((s.webhook_events as string[]).includes(evId))
    return json({ ok: true, duplicate: true, status: s.status });

  const events = [...(s.webhook_events as string[]), evId];
  const now = new Date().toISOString();

  if (s.status === "PENDING" && new Date(s.expires_at) < new Date()) {
    await db.from("makhie_crypto_sessions").update({ status: "EXPIRED" }).eq("id", s.id);
    return json({ ok: false, status: "EXPIRED" });
  }
  if (ev.event === "detected" && s.status === "PENDING") {
    await db.from("makhie_crypto_sessions").update({
      status: "PROCESSING", provider_tx_id: ev.provider_tx_id, webhook_events: events,
    }).eq("id", s.id);
    return json({ ok: true, status: "PROCESSING" });
  }
  if (ev.event === "confirmed" && s.status === "PROCESSING") {
    await db.from("makhie_crypto_sessions").update({
      status: "COMPLETED", tx_hash: ev.tx_hash ?? null, completed_at: now, webhook_events: events,
    }).eq("id", s.id);
    return json({ ok: true, status: "COMPLETED" });
  }
  if (ev.event === "failed" && (s.status === "PENDING" || s.status === "PROCESSING")) {
    await db.from("makhie_crypto_sessions").update({
      status: "FAILED", webhook_events: events,
    }).eq("id", s.id);
    return json({ ok: true, status: "FAILED" });
  }
  return json({ ok: false, status: s.status, reason: "invalid transition" }, 409);
});
