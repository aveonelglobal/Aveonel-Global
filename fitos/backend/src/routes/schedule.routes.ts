import { Router } from "express";
import { z } from "zod";
import { uploadSchedule } from "../modules/scheduler/scheduler.service";

export const scheduleRouter = Router();

const scheduleDaySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  work_start: z.string().regex(/^\d{2}:\d{2}$/).nullish(),
  work_end: z.string().regex(/^\d{2}:\d{2}$/).nullish(),
  commute_minutes_override: z.number().int().min(0).nullish(),
  is_day_off: z.boolean().optional(),
  is_travel_day: z.boolean().optional(),
  energy_level: z.enum(["low", "normal", "high"]).optional(),
  notes: z.string().optional(),
});

const uploadScheduleSchema = z.object({
  week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.array(scheduleDaySchema).length(7),
});

/**
 * POST /upload-schedule
 * The ONLY manual input step in FitOS. Body: { week_start_date, days: [...7] }
 */
scheduleRouter.post("/upload-schedule", async (req, res, next) => {
  try {
    const input = uploadScheduleSchema.parse(req.body);
    const result = await uploadSchedule(req.profile!.id, req.profile!, input);
    res.status(201).json({
      schedule_id: result.scheduleId,
      week_start_date: input.week_start_date,
      normalized_days: result.normalizedDays,
    });
  } catch (err) {
    next(err);
  }
});
