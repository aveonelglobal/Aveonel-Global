import {
  CyclePhase,
  DailyPlan,
  MealSlot,
  NormalizedScheduleDay,
  PantryItem,
  PlannedMeal,
  Recipe,
  UserProfile,
  WeeklyPlan,
} from "../../types";
import { queryRecipes } from "../recipes/recipes.service";
import { adjustTargetForCyclePhase, calorieBudgetPerSlot } from "../../utils/nutrition";
import { dateForDayOfWeek, toMinutes } from "../../utils/time";
import { generateDailyWorkout } from "../workouts/workout.service";
import { generateDailyReminders } from "../reminders/reminders.service";

const SLOT_TO_CATEGORY: Record<MealSlot, Recipe["category"]> = {
  breakfast: "breakfast",
  snack_am: "snack",
  lunch: "lunch",
  snack_pm: "snack",
  dinner: "dinner",
};

const SLOT_SCHEDULED_TIME: Record<MealSlot, string> = {
  breakfast: "07:30",
  snack_am: "11:00",
  lunch: "13:30",
  snack_pm: "17:00",
  dinner: "20:00",
};

interface SelectionContext {
  day: NormalizedScheduleDay;
  slot: MealSlot;
  targetCalories: number;
  targetProtein: number;
  usedRecipeIdsThisWeek: Map<string, number>; // recipeId -> times used
  pantryItemNames: Set<string>;
  expiringIngredientNames: Set<string>;
}

function scoreRecipe(recipe: Recipe, ctx: SelectionContext): number {
  const calorieDiff = Math.abs(recipe.calories - ctx.targetCalories);
  const proteinDiff = Math.abs(recipe.protein_g - ctx.targetProtein);
  let score = -(calorieDiff * 1.0 + proteinDiff * 2.0);

  // Variety penalty: discourage repeating the same recipe too often in one week.
  const timesUsed = ctx.usedRecipeIdsThisWeek.get(recipe.id) ?? 0;
  score -= timesUsed * 40;

  // Pantry-first: prioritize recipes that use ingredients already on hand.
  const pantryHits = recipe.ingredients.filter((i) => ctx.pantryItemNames.has(i.name.toLowerCase())).length;
  score += pantryHits * 8;

  // Expiring ingredients should be used first.
  const expiringHits = recipe.ingredients.filter((i) => ctx.expiringIngredientNames.has(i.name.toLowerCase())).length;
  score += expiringHits * 20;

  return score;
}

/**
 * Rule (D): if work ends >= 8 PM, dinner must be quick (<15 min prep).
 * Rule (D): if commute > 1hr, breakfast must be portable.
 * Rule: busy day (work_start set and free_minutes low) -> simplify (short prep+cook).
 * Rule: free day (is_day_off) -> batch cooking allowed/encouraged.
 */
async function candidatesForSlot(ctx: SelectionContext): Promise<Recipe[]> {
  const category = SLOT_TO_CATEGORY[ctx.slot];
  const isBusyDay = !ctx.day.is_day_off && ctx.day.free_minutes < 180;
  const isFreeDay = !!ctx.day.is_day_off;

  let maxPrepTimeMin: number | undefined;
  let portableOnly = false;
  let lunchboxOnly = false;

  if (ctx.slot === "dinner" && ctx.day.is_late_finish) {
    maxPrepTimeMin = 15;
  }
  if (ctx.slot === "breakfast" && ctx.day.is_long_commute) {
    portableOnly = true;
  }
  if (isBusyDay) {
    maxPrepTimeMin = Math.min(maxPrepTimeMin ?? 20, 20);
  }
  if (ctx.slot === "lunch" && !isFreeDay) {
    // Lunch is typically eaten away from home on a working day - favor lunchbox-safe recipes.
    lunchboxOnly = true;
  }

  let recipes = await queryRecipes({
    category,
    maxPrepTimeMin,
    portableOnly,
    lunchboxOnly,
    batchCookableOnly: isFreeDay ? undefined : undefined,
    weekend: ctx.day.day_of_week >= 5,
  });

  // Fallback: if strict filters return nothing (e.g. no portable snack matches),
  // progressively relax constraints rather than leaving the slot unplanned.
  if (recipes.length === 0 && lunchboxOnly) {
    recipes = await queryRecipes({ category, maxPrepTimeMin, portableOnly, weekend: ctx.day.day_of_week >= 5 });
  }
  if (recipes.length === 0 && portableOnly) {
    recipes = await queryRecipes({ category, maxPrepTimeMin, weekend: ctx.day.day_of_week >= 5 });
  }
  if (recipes.length === 0 && maxPrepTimeMin !== undefined) {
    recipes = await queryRecipes({ category, weekend: ctx.day.day_of_week >= 5 });
  }
  if (recipes.length === 0) {
    recipes = await queryRecipes({ category });
  }

  return recipes;
}

async function selectMealForSlot(ctx: SelectionContext): Promise<Recipe> {
  const candidates = await candidatesForSlot(ctx);
  if (candidates.length === 0) {
    throw new Error(`No recipes available for category derived from slot "${ctx.slot}". Seed the recipes table.`);
  }
  const ranked = candidates
    .map((r) => ({ recipe: r, score: scoreRecipe(r, ctx) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0].recipe;
}

export interface DailyPlanOptions {
  profile: UserProfile;
  day: NormalizedScheduleDay;
  weekStartDate: string;
  cyclePhase?: CyclePhase;
  usedRecipeIdsThisWeek: Map<string, number>;
  pantryItems: PantryItem[];
}

export async function generateDailyMealPlan(opts: DailyPlanOptions): Promise<DailyPlan> {
  const { profile, day, weekStartDate, cyclePhase, usedRecipeIdsThisWeek, pantryItems } = opts;
  const date = dateForDayOfWeek(weekStartDate, day.day_of_week);

  const dayTarget = adjustTargetForCyclePhase(profile, cyclePhase);
  const slotBudgets = calorieBudgetPerSlot(dayTarget);

  const pantryItemNames = new Set(pantryItems.map((p) => p.name.toLowerCase()));
  const now = Date.now();
  const expiringIngredientNames = new Set(
    pantryItems
      .filter((p) => p.expires_on && new Date(p.expires_on).getTime() - now < 3 * 24 * 60 * 60 * 1000)
      .map((p) => p.name.toLowerCase())
  );

  const slots: MealSlot[] = ["breakfast", "snack_am", "lunch", "snack_pm", "dinner"];
  const meals: PlannedMeal[] = [];

  for (const slot of slots) {
    const budget = slotBudgets[slot];
    const recipe = await selectMealForSlot({
      day,
      slot,
      targetCalories: budget.calories,
      targetProtein: budget.protein_g,
      usedRecipeIdsThisWeek,
      pantryItemNames,
      expiringIngredientNames,
    });

    usedRecipeIdsThisWeek.set(recipe.id, (usedRecipeIdsThisWeek.get(recipe.id) ?? 0) + 1);

    meals.push({
      meal_date: date,
      day_of_week: day.day_of_week,
      meal_slot: slot,
      scheduled_time: SLOT_SCHEDULED_TIME[slot],
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      calories: recipe.calories,
      protein_g: recipe.protein_g,
      soak_required: recipe.soak_required,
    });
  }

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = Math.round(meals.reduce((sum, m) => sum + m.protein_g, 0) * 10) / 10;

  const workout = generateDailyWorkout({ day, date });

  // Reminders (specifically night-prep) need tomorrow's meals/schedule to be
  // meaningful, so they're filled in by generateWeeklyMealPlan's second pass
  // (or by the /generate-daily-plan route when the next day is already known).
  return {
    date,
    day_of_week: day.day_of_week,
    meals,
    total_calories: totalCalories,
    total_protein_g: totalProtein,
    workout,
    reminders: [],
  };
}

export async function generateWeeklyMealPlan(
  profile: UserProfile,
  weekStartDate: string,
  normalizedDays: NormalizedScheduleDay[],
  cyclePhaseByDay: Map<number, CyclePhase>,
  pantryItems: PantryItem[]
): Promise<WeeklyPlan> {
  const usedRecipeIdsThisWeek = new Map<string, number>();
  const days: DailyPlan[] = [];

  const sortedDays = [...normalizedDays].sort((a, b) => a.day_of_week - b.day_of_week);
  for (const day of sortedDays) {
    const dailyPlan = await generateDailyMealPlan({
      profile,
      day,
      weekStartDate,
      cyclePhase: cyclePhaseByDay.get(day.day_of_week),
      usedRecipeIdsThisWeek,
      pantryItems,
    });
    days.push(dailyPlan);
  }

  // Second pass: fill in each day's reminders with a lookahead into the next
  // calendar day so night-prep tasks (soak dal, pack lunch) reference what's
  // actually needed tomorrow instead of what was already eaten today.
  for (let i = 0; i < days.length; i++) {
    const today = days[i];
    const tomorrow = days[i + 1]; // undefined for the last day of the week
    const tomorrowScheduleDay = tomorrow ? sortedDays.find((d) => d.day_of_week === tomorrow.day_of_week) : undefined;

    today.reminders = generateDailyReminders({
      profile,
      date: today.date,
      meals: today.meals,
      workout: today.workout,
      nextDayMeals: tomorrow?.meals,
      nextDayNeedsQuickPrep: !!tomorrowScheduleDay && (tomorrowScheduleDay.is_long_commute || tomorrowScheduleDay.is_late_finish),
    });
  }

  const avgTarget = adjustTargetForCyclePhase(profile, undefined);

  return {
    week_start_date: weekStartDate,
    days,
    total_calories_target: avgTarget.calories,
    total_protein_target: avgTarget.protein_g,
  };
}

// Used by callers that only have raw "HH:MM" strings, e.g. when re-deriving late-finish status.
export function isLateFinish(workEnd?: string | null): boolean {
  return !!workEnd && toMinutes(workEnd) >= toMinutes("20:00");
}
