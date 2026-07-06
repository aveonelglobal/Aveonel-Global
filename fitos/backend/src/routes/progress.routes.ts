import { Router } from "express";
import { z } from "zod";
import { logProgress } from "../modules/progress/progress.service";

export const progressRouter = Router();

const logProgressSchema = z.object({
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weight_kg: z.number().positive().optional(),
  water_intake_ml: z.number().int().min(0).optional(),
  calories_consumed: z.number().int().min(0).optional(),
  protein_consumed_g: z.number().min(0).optional(),
  workout_completed: z.boolean().optional(),
  mood: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * POST /log-progress
 * Body: any subset of { log_date (required), weight_kg, water_intake_ml,
 * calories_consumed, protein_consumed_g, workout_completed, mood, notes }.
 * Upserts the day's log and recomputes its adherence score.
 */
progressRouter.post("/log-progress", async (req, res, next) => {
  try {
    const input = logProgressSchema.parse(req.body);
    const log = await logProgress(req.profile!, input);
    res.status(200).json(log);
  } catch (err) {
    next(err);
  }
});
