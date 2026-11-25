import { store, json } from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "GET") return json({ error: "Método não permitido" }, 405);
  const d = await store().get("config", { type: "json" });
  if (!d) return json({ error: "Nada publicado ainda" }, 404);
  const head = new URL(req.url).searchParams.get("head");
  return json(head ? { ts: d.ts } : d);
};
