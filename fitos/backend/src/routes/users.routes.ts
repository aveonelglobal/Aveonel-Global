import { Router } from "express";
import { z } from "zod";
import { updateUserProfile } from "../modules/users/users.service";

export const usersRouter = Router();

/** GET /me - the current user's FitOS profile (auto-created on first login). */
usersRouter.get("/me", async (req, res) => {
  res.json(req.profile);
});

const updateProfileSchema = z
  .object({
    full_name: z.string().optional(),
    weight_kg: z.number().positive().optional(),
    height_cm: z.number().positive().optional(),
    goal: z.enum(["fat_loss", "maintenance", "muscle_gain", "health_improvement"]).optional(),
    calorie_target_min: z.number().int().positive().optional(),
    calorie_target_max: z.number().int().positive().optional(),
    protein_target_min: z.number().int().positive().optional(),
    protein_target_max: z.number().int().positive().optional(),
    water_target_ml: z.number().int().positive().optional(),
    cycle_tracking_enabled: z.boolean().optional(),
    commute_minutes: z.number().int().min(0).optional(),
    telegram_chat_id: z.string().optional(),
  })
  .strict();

/** PATCH /me - update profile fields (e.g. updated weight, commute time, telegram_chat_id after linking the bot). */
usersRouter.patch("/me", async (req, res, next) => {
  try {
    const patch = updateProfileSchema.parse(req.body);
    const updated = await updateUserProfile(req.profile!.id, patch);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});
