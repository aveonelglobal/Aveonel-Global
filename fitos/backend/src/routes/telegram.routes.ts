import { Request, Response, Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { getSupabase } from "../db/client";

export const telegramRouter = Router();

/**
 * These two endpoints solve the chicken-and-egg problem of linking a
 * Telegram chat to a FitOS profile: they're gated only by the shared webhook
 * secret (not requireAuth's user_id-in-body lookup), because at link time or
 * resolve time the bot doesn't yet know which profile it's talking to.
 */
function checkWebhookSecret(req: Request, res: Response): boolean {
  const secret = req.header("x-fitos-webhook-secret");
  if (secret !== env.webhookSecret) {
    res.status(401).json({ error: "Invalid or missing x-fitos-webhook-secret header" });
    return false;
  }
  return true;
}

const linkSchema = z.object({
  user_id: z.string().uuid(),
  chat_id: z.string().min(1),
});

/** POST /telegram/link - body: { user_id, chat_id }. Called once when the user runs /link <user_id> in the bot. */
telegramRouter.post("/telegram/link", async (req, res, next) => {
  try {
    if (!checkWebhookSecret(req, res)) return;
    const { user_id, chat_id } = linkSchema.parse(req.body);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .update({ telegram_chat_id: chat_id })
      .eq("id", user_id)
      .select()
      .single();
    if (error) throw error;
    res.status(200).json({ linked: true, user_id: data.id });
  } catch (err) {
    next(err);
  }
});

const resolveSchema = z.object({ chat_id: z.string().min(1) });

/** GET /telegram/resolve?chat_id=... - looks up which FitOS user_id a chat is linked to. */
telegramRouter.get("/telegram/resolve", async (req, res, next) => {
  try {
    if (!checkWebhookSecret(req, res)) return;
    const { chat_id } = resolveSchema.parse(req.query);
    const supabase = getSupabase();
    const { data, error } = await supabase.from("users").select("id").eq("telegram_chat_id", chat_id).maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "No FitOS profile linked to this chat_id yet. Send /link <user_id> first." });
      return;
    }
    res.status(200).json({ user_id: data.id });
  } catch (err) {
    next(err);
  }
});
