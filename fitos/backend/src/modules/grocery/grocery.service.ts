import { getSupabase } from "../../db/client";
import { getRecipeById } from "../recipes/recipes.service";
import { GroceryItemAggregate, PantryItem, WeeklyPlan } from "../../types";

function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * (D) Grocery Generator - core aggregation.
 * Pulls each recipe's ingredient list and folds them into one deduplicated
 * list grouped by category. Ingredients already sitting in the pantry are
 * flagged rather than dropped, so the frontend/Telegram bot can show them as
 * "already have" instead of silently omitting them.
 */
export async function generateGroceryListFromRecipeIds(
  recipeIds: string[],
  pantryItems: PantryItem[]
): Promise<GroceryItemAggregate[]> {
  const pantryNames = new Set(pantryItems.map((p) => normalizeIngredientName(p.name)));
  const uniqueIds = Array.from(new Set(recipeIds));
  const recipes = await Promise.all(uniqueIds.map((id) => getRecipeById(id)));

  const aggregated = new Map<string, GroceryItemAggregate>();
  for (const recipe of recipes) {
    if (!recipe) continue;
    for (const ingredient of recipe.ingredients) {
      const key = normalizeIngredientName(ingredient.name);
      const existing = aggregated.get(key);
      const isInPantry = pantryNames.has(key);
      if (existing) {
        // Quantities are free-text ("1/2 cup"), so we combine rather than
        // attempt unreliable unit arithmetic across heterogeneous recipes.
        if (!existing.quantity.includes(ingredient.quantity)) {
          existing.quantity = `${existing.quantity} + ${ingredient.quantity}`;
        }
        if (!existing.source_recipe_ids.includes(recipe.id)) existing.source_recipe_ids.push(recipe.id);
      } else {
        aggregated.set(key, {
          name: ingredient.name,
          category: ingredient.category,
          quantity: ingredient.quantity,
          already_in_pantry: isInPantry,
          source_recipe_ids: [recipe.id],
        });
      }
    }
  }

  return Array.from(aggregated.values()).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

/**
 * Convenience wrapper for a freshly computed WeeklyPlan (used right after
 * meal planning, before anything is persisted).
 */
export async function generateGroceryListFromPlan(
  plan: WeeklyPlan,
  pantryItems: PantryItem[]
): Promise<GroceryItemAggregate[]> {
  const recipeIds = plan.days.flatMap((day) => day.meals.map((m) => m.recipe_id));
  return generateGroceryListFromRecipeIds(recipeIds, pantryItems);
}

export function groupGroceryItemsByCategory(
  items: GroceryItemAggregate[]
): Record<string, GroceryItemAggregate[]> {
  const grouped: Record<string, GroceryItemAggregate[]> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }
  return grouped;
}

export async function persistGroceryList(
  userId: string,
  weekStartDate: string,
  mealPlanId: string | null,
  items: GroceryItemAggregate[]
): Promise<string> {
  const supabase = getSupabase();

  await supabase.from("grocery_lists").delete().eq("user_id", userId).eq("week_start_date", weekStartDate);

  const { data: list, error: listErr } = await supabase
    .from("grocery_lists")
    .insert({ user_id: userId, meal_plan_id: mealPlanId, week_start_date: weekStartDate, status: "pending" })
    .select()
    .single();
  if (listErr) throw listErr;

  if (items.length > 0) {
    const { error: itemsErr } = await supabase.from("grocery_items").insert(
      items.map((item) => ({
        grocery_list_id: list.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        already_in_pantry: item.already_in_pantry,
        source_recipe_ids: item.source_recipe_ids,
      }))
    );
    if (itemsErr) throw itemsErr;
  }

  return list.id;
}

export async function getGroceryList(userId: string, weekStartDate: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("grocery_lists")
    .select("*, grocery_items(*)")
    .eq("user_id", userId)
    .eq("week_start_date", weekStartDate)
    .maybeSingle();
  if (error) throw error;
  return data;
}
