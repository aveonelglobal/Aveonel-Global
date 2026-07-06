import { NextFunction, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import { ensureUserProfile } from "../modules/users/users.service";
import { UserProfile } from "../types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      profile?: UserProfile;
    }
  }
}

/**
 * Two supported callers:
 *  1. A logged-in user's browser/Telegram session sends a Supabase JWT as
 *     `Authorization: Bearer <token>`. We verify it against Supabase Auth and
 *     load/create their profile.
 *  2. n8n automation workflows send `x-fitos-webhook-secret` plus a
 *     `user_id` in the request body, since scheduled jobs run without a live
 *     user session.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const webhookSecret = req.header("x-fitos-webhook-secret");
    if (webhookSecret) {
      if (webhookSecret !== env.webhookSecret) {
        res.status(401).json({ error: "Invalid webhook secret" });
        return;
      }
      const userId = (req.body?.user_id as string) || (req.query.user_id as string);
      if (!userId) {
        res.status(400).json({ error: "user_id is required for webhook-authenticated requests" });
        return;
      }
      const { getUserProfile } = await import("../modules/users/users.service");
      const profile = await getUserProfile(userId);
      if (!profile) {
        res.status(404).json({ error: `No FitOS profile found for user_id ${userId}` });
        return;
      }
      req.profile = profile;
      next();
      return;
    }

    const authHeader = req.header("authorization") ?? req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token) {
      res.status(401).json({ error: "Missing Authorization: Bearer <token> header" });
      return;
    }

    const authClient = createClient(env.supabaseUrl, env.supabaseAnonKey || env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired session token" });
      return;
    }

    req.profile = await ensureUserProfile(data.user.id, data.user.email ?? "");
    next();
  } catch (err) {
    next(err);
  }
}
