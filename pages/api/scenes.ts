// pages/api/scenes.ts
import { NextApiRequest, NextApiResponse } from "next";
import { store, addActivity } from "./_store";
import { v4 as uuid } from "uuid";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(store.scenes);
  }
  if (req.method === 'POST') {
    const { name, actions } = req.body;
    const s = { id: uuid(), name, actions: actions || [] };
    store.scenes.push(s);
    addActivity(`Scene created: ${name}`);
    return res.status(201).json(s);
  }
  res.status(405).end();
}
