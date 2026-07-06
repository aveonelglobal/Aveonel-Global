import TelegramBot from "node-telegram-bot-api";
import { getDashboard } from "../api";

interface DashboardMeal {
  meal_slot: string;
  scheduled_time?: string | null;
  calories: number;
  protein_g: number;
  recipes?: { name: string } | null;
}

interface DashboardResponse {
  date: string;
  today: {
    meals: DashboardMeal[];
    workout: { title: string; duration_min: number; intensity: string } | null;
    reminders: Array<{ reminder_time: string; title: string }>;
    progress: { weight_kg?: number; water_intake_ml?: number; adherence_score?: number } | null;
  };
}

const SLOT_ORDER = ["breakfast", "snack_am", "lunch", "snack_pm", "dinner"];
const SLOT_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  snack_am: "Morning snack",
  lunch: "Lunch",
  snack_pm: "Evening snack",
  dinner: "Dinner",
};

/** /today - today's full plan: meals, workout, upcoming reminders, and logged progress so far. */
export async function handleToday(bot: TelegramBot, chatId: number, userId: string): Promise<void> {
  const dashboard = await getDashboard(userId) as DashboardResponse;
  const { today, date } = dashboard;

  const mealLines = [...today.meals]
    .sort((a, b) => SLOT_ORDER.indexOf(a.meal_slot) - SLOT_ORDER.indexOf(b.meal_slot))
    .map((m) => `${m.scheduled_time ?? "--:--"}  ${SLOT_LABEL[m.meal_slot] ?? m.meal_slot}: ${m.recipes?.name ?? "?"} (${m.calories}kcal / ${m.protein_g}g protein)`)
    .join("\n");

  const workoutLine = today.workout
    ? `${today.workout.title} - ${today.workout.duration_min} min (${today.workout.intensity})`
    : "No workout planned yet - run /week to generate this week's plan.";

  const progressLine = today.progress
    ? `Weight: ${today.progress.weight_kg ?? "-"}kg | Water: ${today.progress.water_intake_ml ?? 0}ml | Adherence: ${today.progress.adherence_score ?? "-"}%`
    : "No progress logged yet today - use /log weight <kg> or /log food <calories> <protein>.";

  const message = [
    `FitOS - ${date}`,
    "",
    "Meals:",
    mealLines || "No meals planned for today.",
    "",
    "Workout:",
    workoutLine,
    "",
    "Progress:",
    progressLine,
  ].join("\n");

  await bot.sendMessage(chatId, message);
}
