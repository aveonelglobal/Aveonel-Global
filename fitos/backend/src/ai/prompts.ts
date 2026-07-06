import { NormalizedScheduleDay, Recipe, UserProfile, WeeklyPlan } from "../types";

/**
 * AI Prompt Layer.
 *
 * FitOS's planning engines (meal, grocery, workout, reminder) are fully
 * deterministic and rule-based by default - the product works completely
 * with ANTHROPIC_API_KEY unset. When a key IS configured, aiClient.ts sends
 * these prompts to Claude to (a) generate a natural-language weekly summary,
 * and (b) sanity-check the rule-based plan against the user's hard
 * constraints, catching anything the rules engine could have missed. The
 * rule-based engine's output is always the source of truth for numbers
 * (calories/protein/ingredients); the LLM is only used for narrative and
 * qualitative review, never to invent recipes or nutrition data.
 */

const SYSTEM_CONTEXT = `You are the AI Planner Core of FitOS, a personal health operating system for a
pure vegetarian Gujarati Indian diet (no eggs, no meat, no fish). The user is 4'11", ~62kg, aiming for
sustainable fat loss with a daily target of 1300-1500 kcal and 70-90g protein. She has an irregular
menstrual cycle (adaptive nutrition applies) and a busy, variable work schedule with up to a 1.5 hour
commute. She should never need to make manual planning decisions - only submit her weekly schedule.`;

export function buildMealGenerationPrompt(params: {
  profile: UserProfile;
  day: NormalizedScheduleDay;
  slotCalorieTarget: number;
  slotProteinTarget: number;
  candidateRecipes: Recipe[];
}): string {
  const { day, slotCalorieTarget, slotProteinTarget, candidateRecipes } = params;
  return `${SYSTEM_CONTEXT}

Task: choose ONE recipe for this meal slot from the candidate list below - do not invent a recipe or
alter its nutrition values.

Day context:
- Day of week index: ${day.day_of_week} (0=Monday)
- Work hours: ${day.work_start ?? "none"} - ${day.work_end ?? "none"}
- Commute: ${day.commute_minutes} min each way (long commute: ${day.is_long_commute})
- Late finish (>=20:00): ${day.is_late_finish}
- Free minutes today: ${day.free_minutes}
- Day off: ${!!day.is_day_off}

Target for this slot: ${slotCalorieTarget} kcal, ${slotProteinTarget}g protein.

Candidate recipes (name | calories | protein_g | prep_time_min | cook_time_min | portable | lunchbox_suitable):
${candidateRecipes
  .map(
    (r) =>
      `- ${r.name} | ${r.calories}kcal | ${r.protein_g}g | prep ${r.prep_time_min}m | cook ${r.cook_time_min}m | portable=${r.portable} | lunchbox=${r.lunchbox_suitable}`
  )
  .join("\n")}

Respond with only the exact recipe name that best fits the slot's nutrition target and the day's time
constraints (respect: dinner must be <15 min prep if late finish; breakfast must be portable if long commute).`;
}

export function buildGroceryGenerationPrompt(plan: WeeklyPlan): string {
  return `${SYSTEM_CONTEXT}

Task: given this week's planned meals, produce a consolidated, deduplicated grocery list grouped by
category (vegetables, fruits, dairy, grains, pulses, spices, condiments, other). Combine repeated
ingredients into a single line with a summed quantity where units match; otherwise list combined
quantities separated by "+". Do not add any ingredient not present in the meals below.

Week of ${plan.week_start_date}:
${plan.days
  .map(
    (d) =>
      `${d.date}: ` + d.meals.map((m) => `${m.meal_slot}=${m.recipe_name}`).join(", ")
  )
  .join("\n")}`;
}

export function buildWorkoutGenerationPrompt(params: { day: NormalizedScheduleDay }): string {
  const { day } = params;
  return `${SYSTEM_CONTEXT}

Task: suggest a single day's workout (walk / home_workout / rest / yoga / stretch) sized to the
person's actual available time and energy level - never assume a gym or equipment.

Day context:
- Free minutes: ${day.free_minutes} (longest continuous block: ${day.longest_free_block_min} min)
- Energy level: ${day.energy_level}
- Day off: ${!!day.is_day_off}, travel day: ${!!day.is_travel_day}
- Late finish: ${day.is_late_finish}

Respond with: workout_type, duration_min, intensity (low/moderate/high), and a short list of exercises
that fit within the available time.`;
}

export function buildReminderGenerationPrompt(params: { userTimezone: string; waterTargetMl: number }): string {
  return `${SYSTEM_CONTEXT}

Task: schedule reminder times (24h HH:MM, timezone ${params.userTimezone}) across the day for: water
intake (spread across waking hours, daily target ${params.waterTargetMl}ml), each planned meal, the
day's workout, one night-prep reminder (soak dal / prep food / pack lunch for tomorrow), and one
wind-down-for-sleep reminder about 30 minutes before the fixed 22:30 sleep block. Output structured
JSON reminders, each with reminder_type, reminder_time, title, message, and a payload object automation
tools (n8n, Telegram) can act on directly.`;
}

export function buildWeeklySummaryPrompt(plan: WeeklyPlan): string {
  return `${SYSTEM_CONTEXT}

Task: write a short (3-4 sentence), encouraging, non-repetitive natural-language summary of this
week's plan for the user's dashboard. Mention total calorie/protein targets, one or two standout meals,
and the overall workout rhythm for the week. Do not restate every meal.

Week of ${plan.week_start_date} - target ${plan.total_calories_target} kcal / ${plan.total_protein_target}g protein per day.
${plan.days
  .map((d) => `${d.date}: ${d.total_calories}kcal/${d.total_protein_g}g protein, workout=${d.workout.title}`)
  .join("\n")}`;
}
