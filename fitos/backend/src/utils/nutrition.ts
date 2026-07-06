import { CyclePhase, UserProfile } from "../types";

/**
 * Distributes a daily calorie/protein target across meal slots.
 * Percentages reflect a typical Indian eating pattern: a moderate breakfast,
 * the largest meal at lunch, a lighter dinner, and two small snacks.
 */
export const MEAL_SLOT_SPLIT: Record<string, number> = {
  breakfast: 0.25,
  snack_am: 0.08,
  lunch: 0.35,
  snack_pm: 0.07,
  dinner: 0.25,
};

export interface DayNutritionTarget {
  calories: number;
  protein_g: number;
}

/**
 * Adaptive nutrition logic for irregular menstrual cycles.
 * Luteal/menstrual phases typically carry higher energy needs and cravings;
 * we nudge the calorie ceiling upward (never below the base floor) and raise
 * the protein floor slightly to support satiety, rather than cutting harder
 * during a phase where the body already needs more support.
 */
export function adjustTargetForCyclePhase(
  profile: UserProfile,
  phase: CyclePhase | undefined
): DayNutritionTarget {
  const baseCalories = Math.round((profile.calorie_target_min + profile.calorie_target_max) / 2);
  const baseProtein = Math.round((profile.protein_target_min + profile.protein_target_max) / 2);

  if (!profile.cycle_tracking_enabled || !phase || phase === "unknown") {
    return { calories: baseCalories, protein_g: baseProtein };
  }

  switch (phase) {
    case "menstrual":
      // Iron/energy needs rise; allow the top of the range and favor protein/iron-rich meals.
      return { calories: profile.calorie_target_max, protein_g: profile.protein_target_max };
    case "luteal":
      // Cravings + higher BMR in luteal phase - stay near the top of range to avoid binge-triggering deficits.
      return {
        calories: Math.round(profile.calorie_target_max * 0.95),
        protein_g: profile.protein_target_max,
      };
    case "follicular":
    case "ovulation":
      // Energy and insulin sensitivity are typically best here - lean toward the deficit floor.
      return { calories: profile.calorie_target_min, protein_g: baseProtein };
    default:
      return { calories: baseCalories, protein_g: baseProtein };
  }
}

export function calorieBudgetPerSlot(target: DayNutritionTarget) {
  return Object.fromEntries(
    Object.entries(MEAL_SLOT_SPLIT).map(([slot, pct]) => [
      slot,
      { calories: Math.round(target.calories * pct), protein_g: Math.round(target.protein_g * pct * 10) / 10 },
    ])
  ) as Record<string, DayNutritionTarget>;
}

export function computeAdherenceScore(params: {
  caloriesConsumed?: number;
  calorieTargetMin: number;
  calorieTargetMax: number;
  proteinConsumed?: number;
  proteinTargetMin: number;
  waterConsumedMl?: number;
  waterTargetMl: number;
  workoutCompleted?: boolean;
}): number {
  const scores: number[] = [];

  if (params.caloriesConsumed !== undefined) {
    const inRange =
      params.caloriesConsumed >= params.calorieTargetMin * 0.9 &&
      params.caloriesConsumed <= params.calorieTargetMax * 1.1;
    scores.push(inRange ? 100 : Math.max(0, 100 - Math.abs(params.caloriesConsumed - params.calorieTargetMax) / 10));
  }

  if (params.proteinConsumed !== undefined) {
    scores.push(Math.min(100, (params.proteinConsumed / params.proteinTargetMin) * 100));
  }

  if (params.waterConsumedMl !== undefined) {
    scores.push(Math.min(100, (params.waterConsumedMl / params.waterTargetMl) * 100));
  }

  if (params.workoutCompleted !== undefined) {
    scores.push(params.workoutCompleted ? 100 : 40);
  }

  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}
