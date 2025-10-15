// pages/api/run-scene.ts
import { NextApiRequest, NextApiResponse } from "next";
import { runScene } from "./_store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { sceneId } = req.body;
    runScene(sceneId);
    return res.status(200).json({ ok: true });
  }
  res.status(405).end();
}
