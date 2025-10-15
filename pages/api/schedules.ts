// pages/api/schedules.ts
import { NextApiRequest, NextApiResponse } from "next";
import { store, addActivity } from "./_store";
import { v4 as uuid } from "uuid";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(store.schedules);
  }
  if (req.method === 'POST') {
    const { sceneId, time, days } = req.body;
    const s = { id: uuid(), sceneId, time, days, enabled: true };
    store.schedules.push(s);
    addActivity(`Schedule created for scene ${sceneId} at ${time}`);
    return res.status(201).json(s);
  }
  res.status(405).end();
}
