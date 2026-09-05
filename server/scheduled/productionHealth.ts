import type { Request, Response } from "express";

export async function productionHealthHandler(req: Request, res: Response) {
  const timestamp = new Date().toISOString();
  const expected = process.env.CRON_SECRET;
  const provided = req.header("x-cron-secret");
  if (!expected || provided !== expected) return res.status(403).json({ error: "cron-only", timestamp });
  return res.json({ ok: true, timestamp, services: [
    { id: "internal-engine", status: "online" },
    { id: "afip-production", status: "requires_credentials" },
    { id: "banking-production", status: "requires_authorization" },
    { id: "signature-provider", status: "requires_provider" },
  ]});
}
