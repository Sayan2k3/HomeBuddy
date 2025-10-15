// pages/api/activity.ts
import { NextApiRequest, NextApiResponse } from "next";
import { store } from "./_store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(store.activities);
}
