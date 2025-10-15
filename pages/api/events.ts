// pages/api/events.ts
import { NextApiRequest, NextApiResponse } from "next";
import { emitter } from "./_store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // send comment to keep connection alive if needed
  res.write('retry: 10000\n\n');

  const onActivity = (data: any) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) { console.error(err) }
  };

  emitter.on('activity', onActivity);

  req.on('close', () => {
    emitter.off('activity', onActivity);
  });
}
