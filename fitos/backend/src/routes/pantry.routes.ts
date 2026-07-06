import { Router } from "express";
import { z } from "zod";
import { getSupabase } from "../db/client";

export const pantryRouter = Router();

/** GET /pantry - list current pantry stock (used by grocery/meal-planning logic and the dashboard). */
pantryRouter.get("/pantry", async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", req.profile!.id)
      .order("expires_on", { ascending: true, nullsFirst: false });
    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    next(err);
  }
});

const upsertPantryItemSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["vegetables", "fruits", "dairy", "grains", "pulses", "spices", "condiments", "other"]),
  quantity: z.string().optional(),
  expires_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/** POST /pantry - add/update a pantry item (e.g. "bought 2kg toor dal, expires in 6 months"). */
pantryRouter.post("/pantry", async (req, res, next) => {
  try {
    const input = upsertPantryItemSchema.parse(req.body);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("pantry_items")
      .insert({ user_id: req.profile!.id, ...input })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

/** DELETE /pantry/:id - remove a pantry item once it's used up. */
pantryRouter.delete("/pantry/:id", async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("pantry_items")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.profile!.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
