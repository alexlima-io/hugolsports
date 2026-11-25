import { store, json, pinOk, blocked, fail, clear } from "../lib/auth.mjs";

const KEY = "stats";

export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
  let body;
  try { body = await req.json(); } catch (_) { return json({ error: "Requisição inválida" }, 400); }
  body = body || {};

  // Proprietário pedindo as estatísticas
  if (body.pin !== undefined) {
    if (await blocked(req, context)) return json({ error: "Muitas tentativas" }, 429);
    if (!pinOk(body.pin)) { await fail(req, context); return json({ error: "Senha incorreta" }, 401); }
    await clear(req, context);
    const s = (await store().get(KEY, { type: "json" })) || { o: 0, w: 0, v: {}, since: Date.now() };
    return json(s);
  }

  // Cliente registrando um evento: o = visita, w = clique no WhatsApp, v = visualização de produto
  const e = body.e;
  if (!["o", "w", "v"].includes(e)) return json({ error: "Evento inválido" }, 400);
  const s = (await store().get(KEY, { type: "json" })) || { o: 0, w: 0, v: {}, since: Date.now() };
  if (e === "v") {
    const id = String(body.id || "").slice(0, 40);
    if (id && (s.v[id] || Object.keys(s.v).length < 1000)) s.v[id] = (s.v[id] || 0) + 1;
  } else s[e] = (s[e] || 0) + 1;
  await store().setJSON(KEY, s);
  return json({ ok: true });
};
