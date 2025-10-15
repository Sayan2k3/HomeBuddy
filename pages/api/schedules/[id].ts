// pages/api/schedules/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { store, addActivity } from "../_store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  if (req.method === 'DELETE') {
    const idx = store.schedules.findIndex(s => s.id === id);
    if (idx >= 0) {
      const [s] = store.schedules.splice(idx, 1);
      addActivity(`Schedule deleted: ${s.id}`);
      return res.status(200).json({ ok: true });
    }
    return res.status(404).json({ error: 'not found' });
  } else if (req.method === 'PATCH') {
    const body = req.body;
    const s = store.schedules.find(x => x.id === id);
    if (!s) return res.status(404).json({ error: 'not found' });
    if (typeof body.enabled === 'boolean') s.enabled = body.enabled;
    if (body.time) s.time = body.time;
    if (Array.isArray(body.days)) s.days = body.days;
    return res.status(200).json(s);
  }
  res.status(405).end();
}
