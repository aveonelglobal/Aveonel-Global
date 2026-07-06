import { getSupabase } from "../../db/client";
import { CyclePhase, DailyPlan, NormalizedScheduleDay, PantryItem, UserProfile, WeeklyPlan } from "../../types";
import { normalizeScheduleDay } from "../../utils/time";
import { generateWeeklyMealPlan } from "../mealPlanning/mealPlanner.service";
import { generateGroceryListFromPlan, persistGroceryList } from "../grocery/grocery.service";
import { persistDailyReminders } from "../reminders/reminders.service";
import { generateText } from "../../ai/aiClient";
import { buildWeeklySummaryPrompt } from "../../ai/prompts";

export interface FullWeeklyPlanResult {
  mealPlanId: string;
  plan: WeeklyPlan;
  groceryListId: string;
  summary: string;
}

async function loadNormalizedScheduleDays(
  userId: string,
  weekStartDate: string,
  defaultCommuteMinutes: number
): Promise<{ scheduleId: string | null; days: NormalizedScheduleDay[] }> {
  const supabase = getSupabase();
  const { data: schedule, error } = await supabase
    .from("schedules")
    .select("id, schedule_days(*)")
    .eq("user_id", userId)
    .eq("week_start_date", weekStartDate)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;

  if (!schedule) {
    throw new Error(
      `No active schedule found for week ${weekStartDate}. Call /upload-schedule first - it is the only manual input FitOS needs.`
    );
  }

  const rawDays = (schedule as unknown as { schedule_days: Array<Record<string, unknown>> }).schedule_days;
  const days = rawDays
    .map((d) =>
      normalizeScheduleDay(
        {
          day_of_week: d.day_of_week as number,
          work_start: d.work_start as string | null,
          work_end: d.work_end as string | null,
          commute_minutes_override: d.commute_minutes_override as number | null,
          is_day_off: d.is_day_off as boolean,
          is_travel_day: d.is_travel_day as boolean,
          energy_level: d.energy_level as NormalizedScheduleDay["energy_level"],
          notes: d.notes as string | undefined,
        },
        defaultCommuteMinutes
      )
    )
    .sort((a, b) => a.day_of_week - b.day_of_week);

  return { scheduleId: schedule.id, days };
}

async function loadCyclePhaseByDay(
  userId: string,
  weekStartDate: string,
  cycleTrackingEnabled: boolean
): Promise<Map<number, CyclePhase>> {
  const map = new Map<number, CyclePhase>();
  if (!cycleTrackingEnabled) return map;

  const supabase = getSupabase();
  const weekEnd = new Date(`${weekStartDate}T00:00:00Z`);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  const { data, error } = await supabase
    .from("cycle_logs")
    .select("log_date, phase")
    .eq("user_id", userId)
    .gte("log_date", weekStartDate)
    .lte("log_date", weekEnd.toISOString().slice(0, 10));
  if (error) throw error;

  for (const row of data ?? []) {
    const dayOfWeek = Math.round(
      (new Date(`${row.log_date}T00:00:00Z`).getTime() - new Date(`${weekStartDate}T00:00:00Z`).getTime()) /
        (24 * 60 * 60 * 1000)
    );
    map.set(dayOfWeek, row.phase as CyclePhase);
  }
  return map;
}

async function loadPantryItems(userId: string): Promise<PantryItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("pantry_items").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []) as PantryItem[];
}

async function persistWeeklyPlan(userId: string, scheduleId: string | null, plan: WeeklyPlan): Promise<string> {
  const supabase = getSupabase();

  await supabase.from("meal_plans").delete().eq("user_id", userId).eq("week_start_date", plan.week_start_date);

  const { data: mealPlan, error: mealPlanErr } = await supabase
    .from("meal_plans")
    .insert({
      user_id: userId,
      schedule_id: scheduleId,
      week_start_date: plan.week_start_date,
      total_calories_target: plan.total_calories_target,
      total_protein_target: plan.total_protein_target,
      status: "active",
    })
    .select()
    .single();
  if (mealPlanErr) throw mealPlanErr;

  for (const day of plan.days) {
    const { error: mealsErr } = await supabase.from("meals").insert(
      day.meals.map((m) => ({
        meal_plan_id: mealPlan.id,
        user_id: userId,
        recipe_id: m.recipe_id,
        meal_date: m.meal_date,
        day_of_week: m.day_of_week,
        meal_slot: m.meal_slot,
        scheduled_time: m.scheduled_time,
        calories: m.calories,
        protein_g: m.protein_g,
        status: "planned",
      }))
    );
    if (mealsErr) throw mealsErr;

    const { error: workoutErr } = await supabase.from("workouts").upsert(
      {
        user_id: userId,
        workout_date: day.workout.workout_date,
        day_of_week: day.workout.day_of_week,
        workout_type: day.workout.workout_type,
        title: day.workout.title,
        description: day.workout.description,
        exercises: day.workout.exercises,
        duration_min: day.workout.duration_min,
        intensity: day.workout.intensity,
        scheduled_time: day.workout.scheduled_time,
        status: "planned",
      },
      { onConflict: "user_id,workout_date" }
    );
    if (workoutErr) throw workoutErr;

    await supabase.from("reminders").delete().eq("user_id", userId).eq("reminder_date", day.date);
    await persistDailyReminders(userId, day.reminders);
  }

  return mealPlan.id;
}

function fallbackSummary(plan: WeeklyPlan): string {
  const totalWorkoutMinutes = plan.days.reduce((sum, d) => sum + d.workout.duration_min, 0);
  const restDays = plan.days.filter((d) => d.workout.workout_type === "rest").length;
  return (
    `Week of ${plan.week_start_date}: targeting ${plan.total_calories_target} kcal and ` +
    `${plan.total_protein_target}g protein/day across ${plan.days.length} days. ` +
    `Total planned activity: ${totalWorkoutMinutes} minutes (${restDays} rest day${restDays === 1 ? "" : "s"}). ` +
    `Meals are matched to each day's schedule - quick and portable on busy/commute-heavy days, ` +
    `fuller and batch-cooked on free days.`
  );
}

/**
 * (H) AI Planner Core - the central orchestrator.
 * Takes only { userId, weekStartDate } (the schedule itself was already
 * uploaded via /upload-schedule), pulls in profile + normalized schedule +
 * cycle phase + pantry state + recipe library, and produces/persists the
 * full weekly plan: meals, workouts, reminders, and grocery list.
 */
export async function generateFullWeeklyPlan(profile: UserProfile, weekStartDate: string): Promise<FullWeeklyPlanResult> {
  const { scheduleId, days } = await loadNormalizedScheduleDays(profile.id, weekStartDate, profile.commute_minutes);
  const cyclePhaseByDay = await loadCyclePhaseByDay(profile.id, weekStartDate, profile.cycle_tracking_enabled);
  const pantryItems = await loadPantryItems(profile.id);

  const plan = await generateWeeklyMealPlan(profile, weekStartDate, days, cyclePhaseByDay, pantryItems);

  const mealPlanId = await persistWeeklyPlan(profile.id, scheduleId, plan);

  const groceryItems = await generateGroceryListFromPlan(plan, pantryItems);
  const groceryListId = await persistGroceryList(profile.id, weekStartDate, mealPlanId, groceryItems);

  const aiSummary = await generateText(buildWeeklySummaryPrompt(plan));
  const summary = aiSummary ?? fallbackSummary(plan);

  return { mealPlanId, plan, groceryListId, summary };
}

/**
 * Returns a single day's plan, regenerating the full week it belongs to first
 * so variety/pantry bookkeeping across the week stays consistent (e.g. after
 * a mid-week schedule change for that day).
 */
export async function regenerateSingleDay(
  profile: UserProfile,
  weekStartDate: string,
  dayOfWeek: number
): Promise<DailyPlan> {
  const full = await generateFullWeeklyPlan(profile, weekStartDate);
  const day = full.plan.days.find((d) => d.day_of_week === dayOfWeek);
  if (!day) throw new Error(`Day of week ${dayOfWeek} not found in week ${weekStartDate}`);
  return day;
}
