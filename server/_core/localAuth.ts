import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import * as db from "../db";
import type { User } from "../../drizzle/schema";

const secret = () => new TextEncoder().encode(ENV.cookieSecret);

type Session = { openId: string; name?: string };

export async function getLocalUser(req: Request): Promise<User | null> {
  const token = req.headers.cookie?.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`))?.[1];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    const openId = typeof payload.openId === "string" ? payload.openId : "";
    if (!openId) return null;
    const stored = await db.getUserByOpenId(openId);
    return stored ?? { id: 0, openId, name: typeof payload.name === "string" ? payload.name : openId, email: null, loginMethod: "local", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
  } catch { return null; }
}

async function issue(req: Request, res: Response, session: Session) {
  try { await db.upsertUser({ openId: session.openId, name: session.name || session.openId, email: null, loginMethod: "local", lastSignedIn: new Date() }); } catch { /* local development can run without a database */ }
  const token = await new SignJWT({ openId: session.openId, name: session.name || session.openId })
    .setProtectedHeader({ alg: "HS256" }).setExpirationTime(Math.floor((Date.now()+ONE_YEAR_MS)/1000)).sign(secret());
  res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
}

export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const openId = typeof req.body?.openId === "string" && req.body.openId.trim() ? req.body.openId.trim() : "admin-local";
    const name = typeof req.body?.name === "string" && req.body.name.trim() ? req.body.name.trim() : "Administrador local";
    await issue(req, res, { openId, name });
    res.json({ success: true });
  });
}
