import { Router } from "express";
import { z } from "zod";
import { getPendingReminders, markReminderSent } from "../modules/reminders/reminders.service";
import { getSupabase } from "../db/client";

export const remindersRouter = Router();

const dateQuerySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

/**
 * GET /reminders/pending?date=YYYY-MM-DD
 * Polled by the n8n daily-reminder-trigger workflow (see automation/n8n) and
 * the Telegram bot's /today command.
 */
remindersRouter.get("/reminders/pending", async (req, res, next) => {
  try {
    const { date } = dateQuerySchema.parse(req.query);
    const reminders = await getPendingReminders(req.profile!.id, date);
    res.json(reminders);
  } catch (err) {
    next(err);
  }
});

/** POST /reminders/:id/sent - marks a reminder as delivered (called by the Telegram-send n8n node). */
remindersRouter.post("/reminders/:id/sent", async (req, res, next) => {
  try {
    await markReminderSent(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/** POST /reminders/:id/ack - user acknowledged the reminder (e.g. tapped a Telegram button). */
remindersRouter.post("/reminders/:id/ack", async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("reminders")
      .update({ status: "acknowledged", acknowledged_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .eq("user_id", req.profile!.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
