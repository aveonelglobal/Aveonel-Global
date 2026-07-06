import { getSupabase } from "../../db/client";
import { Recipe, RecipeCategory } from "../../types";

export interface RecipeQuery {
  category?: RecipeCategory;
  maxPrepTimeMin?: number;
  maxCookTimeMin?: number;
  portableOnly?: boolean;
  lunchboxOnly?: boolean;
  batchCookableOnly?: boolean;
  weekend?: boolean;
  excludeIds?: string[];
  excludeIngredients?: string[];
}

/**
 * Queries the recipe library with the filters the meal planner needs.
 * All Gujarati-vegetarian dietary exclusions (egg/meat/fish) are enforced at
 * the data layer - the seed set contains none - but excludeIngredients lets
 * callers additionally avoid an ingredient the user has flagged (e.g. an
 * allergy or a pantry item that's run out).
 */
export async function queryRecipes(query: RecipeQuery): Promise<Recipe[]> {
  const supabase = getSupabase();
  let builder = supabase.from("recipes").select("*");

  if (query.category) builder = builder.eq("category", query.category);
  if (query.maxPrepTimeMin !== undefined) builder = builder.lte("prep_time_min", query.maxPrepTimeMin);
  if (query.maxCookTimeMin !== undefined) builder = builder.lte("cook_time_min", query.maxCookTimeMin);
  if (query.portableOnly) builder = builder.eq("portable", true);
  if (query.lunchboxOnly) builder = builder.eq("lunchbox_suitable", true);
  if (query.batchCookableOnly) builder = builder.eq("batch_cookable", true);
  if (query.weekend !== undefined) {
    builder = query.weekend ? builder.eq("weekend_suitable", true) : builder.eq("weekday_suitable", true);
  }
  if (query.excludeIds && query.excludeIds.length > 0) {
    builder = builder.not("id", "in", `(${query.excludeIds.join(",")})`);
  }

  const { data, error } = await builder;
  if (error) throw error;

  let recipes = (data ?? []) as Recipe[];

  if (query.excludeIngredients && query.excludeIngredients.length > 0) {
    const excluded = query.excludeIngredients.map((s) => s.toLowerCase());
    recipes = recipes.filter(
      (r) => !r.ingredients.some((ing) => excluded.some((ex) => ing.name.toLowerCase().includes(ex)))
    );
  }

  return recipes;
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Recipe | null;
}

export async function listAllRecipes(): Promise<Recipe[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("recipes").select("*").order("category").order("name");
  if (error) throw error;
  return (data ?? []) as Recipe[];
}
