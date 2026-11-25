import { store, json, pinOk, blocked, fail, clear } from "../lib/auth.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
  let body;
  try { body = await req.json(); } catch (_) { return json({ error: "Requisição inválida" }, 400); }

  if (await blocked(req, context)) return json({ error: "Muitas tentativas. Aguarde alguns minutos." }, 429);
  if (!pinOk(body && body.pin)) { await fail(req, context); return json({ error: "Senha incorreta" }, 401); }
  await clear(req, context);

  if (body.check) return json({ ok: true });

  const d = body.data;
  if (!d || typeof d !== "object" || !Array.isArray(d.products) || !Array.isArray(d.pops) || typeof d.cfg !== "object")
    return json({ error: "Dados inválidos" }, 400);
  const ts = Date.now();
  const payload = { ts, cfg: d.cfg, products: d.products, pops: d.pops };
  if (JSON.stringify(payload).length > 5400000) return json({ error: "As fotos ficaram pesadas demais. Troque ou exclua algumas." }, 413);

  await store().setJSON("config", payload);
  return json({ ok: true, ts });
};
