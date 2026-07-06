import { getSupabase } from "../../db/client";
import { PlannedMeal, ReminderPlan, UserProfile, WorkoutPlan } from "../../types";
import { addMinutes, toMinutes } from "../../utils/time";

interface DailyReminderParams {
  profile: UserProfile;
  date: string;
  meals: PlannedMeal[];
  workout: WorkoutPlan;
  /** Tomorrow's planned meals, if known - night prep tasks (soak dal, pack lunch) target tomorrow, not today. */
  nextDayMeals?: PlannedMeal[];
  /** Whether tomorrow has a long commute or late finish - drives "prep portable breakfast" task. */
  nextDayNeedsQuickPrep?: boolean;
}

const MEAL_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  snack_am: "Morning snack",
  lunch: "Lunch",
  snack_pm: "Evening snack",
  dinner: "Dinner",
};

/**
 * (E) Reminder System.
 * Produces structured, automation-ready reminders for water, meals, workout,
 * night prep (soak dal / prep food / pack lunch) and sleep. Each reminder
 * carries a `payload` object so n8n / the Telegram bot can act on it directly
 * without re-deriving context.
 */
export function generateDailyReminders(params: DailyReminderParams): ReminderPlan[] {
  const { profile, date, meals, workout } = params;
  const reminders: ReminderPlan[] = [];

  // --- Water reminders: spread evenly across waking hours ---
  const waterReminderTimes = ["08:00", "10:30", "13:00", "15:30", "18:00", "20:30"];
  const perReminderMl = Math.round(profile.water_target_ml / waterReminderTimes.length);
  for (const time of waterReminderTimes) {
    reminders.push({
      reminder_date: date,
      reminder_time: time,
      reminder_type: "water",
      title: "Drink water",
      message: `Time to drink ~${perReminderMl}ml of water. Daily target: ${profile.water_target_ml}ml.`,
      payload: { target_ml: perReminderMl, daily_target_ml: profile.water_target_ml },
      channel: "telegram",
    });
  }

  // --- Meal reminders, timed to each planned meal ---
  for (const meal of meals) {
    if (!meal.scheduled_time) continue;
    reminders.push({
      reminder_date: date,
      reminder_time: meal.scheduled_time,
      reminder_type: "meal",
      title: `${MEAL_LABEL[meal.meal_slot] ?? meal.meal_slot} time`,
      message: `${MEAL_LABEL[meal.meal_slot] ?? meal.meal_slot}: ${meal.recipe_name} (${meal.calories} kcal, ${meal.protein_g}g protein).`,
      payload: {
        meal_slot: meal.meal_slot,
        recipe_id: meal.recipe_id,
        recipe_name: meal.recipe_name,
        calories: meal.calories,
        protein_g: meal.protein_g,
      },
      channel: "telegram",
    });
  }

  // --- Workout reminder ---
  if (workout.workout_type !== "rest" && workout.scheduled_time) {
    reminders.push({
      reminder_date: date,
      reminder_time: workout.scheduled_time,
      reminder_type: "workout",
      title: workout.title,
      message: `${workout.description} (${workout.duration_min} min, ${workout.intensity} intensity).`,
      payload: { workout_type: workout.workout_type, duration_min: workout.duration_min, intensity: workout.intensity },
      channel: "telegram",
    });
  }

  // --- Night prep: soak dal for TOMORROW's soak-required meals, prep food, pack tomorrow's lunch ---
  const nextDayMeals = params.nextDayMeals ?? [];
  const tomorrowNeedsSoak = nextDayMeals.some((m) => m.soak_required);
  const nightPrepTasks: string[] = [];
  const nextDayLunch = nextDayMeals.find((m) => m.meal_slot === "lunch");
  if (nextDayLunch) nightPrepTasks.push(`Pack lunchbox: ${nextDayLunch.recipe_name}`);
  if (params.nextDayNeedsQuickPrep) nightPrepTasks.push("Prep breakfast ingredients for a quick portable morning meal");
  if (tomorrowNeedsSoak) nightPrepTasks.push("Soak dal/lentils needed for tomorrow's recipes");
  if (nightPrepTasks.length > 0) {
    reminders.push({
      reminder_date: date,
      reminder_time: "21:00",
      reminder_type: "night_prep",
      title: "Night prep for tomorrow",
      message: nightPrepTasks.join(" | "),
      payload: { tasks: nightPrepTasks },
      channel: "telegram",
    });
  }

  // --- Sleep reminder: wind down ~30 min before the fixed sleep block starts ---
  reminders.push({
    reminder_date: date,
    reminder_time: addMinutes("22:30", -30),
    reminder_type: "sleep",
    title: "Wind down for sleep",
    message: "Put the phone away, dim the lights, and get ready for bed to protect tomorrow's energy levels.",
    payload: {},
    channel: "telegram",
  });

  return reminders.sort((a, b) => toMinutes(a.reminder_time) - toMinutes(b.reminder_time));
}

/**
 * Persists a day's reminders and returns them - used by the /generate-daily-plan
 * route and by the n8n daily-reminder-trigger workflow (see automation/n8n).
 */
export async function persistDailyReminders(userId: string, reminders: ReminderPlan[]): Promise<void> {
  if (reminders.length === 0) return;
  const supabase = getSupabase();
  const { error } = await supabase.from("reminders").insert(
    reminders.map((r) => ({
      user_id: userId,
      reminder_date: r.reminder_date,
      reminder_time: r.reminder_time,
      reminder_type: r.reminder_type,
      title: r.title,
      message: r.message,
      payload: r.payload,
      channel: r.channel,
      status: "pending",
    }))
  );
  if (error) throw error;
}

export async function getPendingReminders(userId: string, date: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .eq("reminder_date", date)
    .order("reminder_time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function markReminderSent(reminderId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("reminders")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", reminderId);
  if (error) throw error;
}
