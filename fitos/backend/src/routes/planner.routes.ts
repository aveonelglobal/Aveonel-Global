import { Router } from "express";
import { z } from "zod";
import { generateFullWeeklyPlan, regenerateSingleDay } from "../modules/planner/plannerCore.service";

export const plannerRouter = Router();

const weekStartSchema = z.object({ week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

/**
 * POST /generate-week-plan
 * Body: { week_start_date }. Requires a schedule already uploaded for that week.
 * Runs the full AI Planner Core: meals, workouts, reminders, grocery list.
 */
plannerRouter.post("/generate-week-plan", async (req, res, next) => {
  try {
    const { week_start_date } = weekStartSchema.parse(req.body);
    const result = await generateFullWeeklyPlan(req.profile!, week_start_date);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

const dailyPlanSchema = z.object({
  week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  day_of_week: z.number().int().min(0).max(6),
});

/**
 * POST /generate-daily-plan
 * Body: { week_start_date, day_of_week }. Regenerates the week (for
 * consistency) and returns just the requested day - used after a mid-week
 * schedule change for a single day.
 */
plannerRouter.post("/generate-daily-plan", async (req, res, next) => {
  try {
    const { week_start_date, day_of_week } = dailyPlanSchema.parse(req.body);
    const day = await regenerateSingleDay(req.profile!, week_start_date, day_of_week);
    res.status(200).json(day);
  } catch (err) {
    next(err);
  }
});
