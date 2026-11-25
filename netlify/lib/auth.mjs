import { createHash, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

export const store = () => getStore("hugol");

export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

// Confere a senha (4 a 8 números) comparando o hash SHA-256 com a variável PUBLISH_PIN_HASH.
export function pinOk(pin) {
  const hash = (process.env.PUBLISH_PIN_HASH || "").trim().toLowerCase();
  if (!hash || typeof pin !== "string" || !/^\d{4,8}$/.test(pin)) return false;
  const a = createHash("sha256").update(pin).digest();
  const b = Buffer.from(hash, "hex");
  return b.length === a.length && timingSafeEqual(a, b);
}

// Limite de tentativas erradas: 5 a cada 15 minutos por IP.
const MAX = 5, WINDOW = 15 * 60 * 1000;
const ipOf = (req, ctx) => String((ctx && ctx.ip) || req.headers.get("x-nf-client-connection-ip") || "x").replace(/[^a-zA-Z0-9.:_-]/g, "_");

export async function blocked(req, ctx) {
  try {
    const r = await store().get("rl-" + ipOf(req, ctx), { type: "json" });
    return !!(r && r.n >= MAX && Date.now() - r.t < WINDOW);
  } catch (_) { return false; }
}
export async function fail(req, ctx) {
  try {
    const k = "rl-" + ipOf(req, ctx), r = await store().get(k, { type: "json" });
    const n = r && Date.now() - r.t < WINDOW ? r.n + 1 : 1;
    await store().setJSON(k, { n, t: n === 1 ? Date.now() : r.t });
  } catch (_) {}
}
export async function clear(req, ctx) {
  try { await store().delete("rl-" + ipOf(req, ctx)); } catch (_) {}
}
