import { Router } from "express";
import { z } from "zod";
import { getSupabase } from "../db/client";
import {
  generateGroceryListFromRecipeIds,
  getGroceryList,
  groupGroceryItemsByCategory,
  persistGroceryList,
} from "../modules/grocery/grocery.service";

export const groceryRouter = Router();

const weekStartQuerySchema = z.object({ week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

/**
 * POST /generate-grocery-list
 * Body: { week_start_date }. Rebuilds the grocery list from that week's
 * already-planned meals + current pantry state - use after editing the
 * pantry, without needing to re-run meal planning.
 */
groceryRouter.post("/generate-grocery-list", async (req, res, next) => {
  try {
    const { week_start_date } = weekStartQuerySchema.parse(req.body);
    const userId = req.profile!.id;
    const supabase = getSupabase();

    const { data: mealPlan, error: mealPlanErr } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("user_id", userId)
      .eq("week_start_date", week_start_date)
      .maybeSingle();
    if (mealPlanErr) throw mealPlanErr;
    if (!mealPlan) {
      res.status(404).json({ error: `No meal plan found for week ${week_start_date}. Call /generate-week-plan first.` });
      return;
    }

    const { data: meals, error: mealsErr } = await supabase
      .from("meals")
      .select("recipe_id")
      .eq("meal_plan_id", mealPlan.id);
    if (mealsErr) throw mealsErr;

    const { data: pantryItems, error: pantryErr } = await supabase.from("pantry_items").select("*").eq("user_id", userId);
    if (pantryErr) throw pantryErr;

    const recipeIds = (meals ?? []).map((m) => m.recipe_id).filter((id): id is string => !!id);
    const items = await generateGroceryListFromRecipeIds(recipeIds, pantryItems ?? []);
    const groceryListId = await persistGroceryList(userId, week_start_date, mealPlan.id, items);

    res.status(200).json({
      grocery_list_id: groceryListId,
      week_start_date,
      items_by_category: groupGroceryItemsByCategory(items),
      total_items: items.length,
    });
  } catch (err) {
    next(err);
  }
});

groceryRouter.get("/grocery-list", async (req, res, next) => {
  try {
    const { week_start_date } = weekStartQuerySchema.parse(req.query);
    const list = await getGroceryList(req.profile!.id, week_start_date);
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
});
