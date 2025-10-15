// pages/api/scenes/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { store, addActivity } from "../_store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  if (req.method === 'DELETE') {
    const idx = store.scenes.findIndex(s => s.id === id);
    if (idx >= 0) {
      const [s] = store.scenes.splice(idx, 1);
      addActivity(`Scene deleted: ${s.name}`);
      return res.status(200).json({ ok: true });
    }
    return res.status(404).json({ error: 'not found' });
  }
  res.status(405).end();
}
