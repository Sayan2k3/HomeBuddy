// pages/api/devices.ts
import { NextApiRequest, NextApiResponse } from "next";
import { store, addActivity } from "./_store";
import { v4 as uuid } from "uuid";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(store.devices);
  }
  if (req.method === 'POST') {
    const { name, room, type } = req.body;
    const d = { id: uuid(), name, room, type, on: false };
    store.devices.push(d);
    addActivity(`Device created: ${name} (${room})`);
    return res.status(201).json(d);
  }
  res.status(405).end();
}
