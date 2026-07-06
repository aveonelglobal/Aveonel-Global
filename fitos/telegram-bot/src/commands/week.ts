import TelegramBot from "node-telegram-bot-api";
import { generateWeekPlan } from "../api";

interface WeeklyPlanDay {
  date: string;
  total_calories: number;
  total_protein_g: number;
  workout: { title: string };
}

interface GenerateWeekResponse {
  plan: { week_start_date: string; days: WeeklyPlanDay[]; total_calories_target: number; total_protein_target: number };
  summary: string;
}

function nextMonday(): string {
  const now = new Date();
  const jsDay = now.getUTCDay();
  const daysUntilMonday = jsDay === 1 ? 0 : ((8 - jsDay) % 7 || 7);
  now.setUTCDate(now.getUTCDate() + (jsDay === 1 ? 0 : daysUntilMonday));
  return now.toISOString().slice(0, 10);
}

/**
 * /week [YYYY-MM-DD]
 * Generates (or regenerates) the full week's plan for the given Monday, or
 * the upcoming Monday if omitted. Requires a schedule already uploaded for
 * that week via the dashboard's weekly schedule form.
 */
export async function handleWeek(bot: TelegramBot, chatId: number, userId: string, weekStartArg?: string): Promise<void> {
  const weekStartDate = weekStartArg && /^\d{4}-\d{2}-\d{2}$/.test(weekStartArg) ? weekStartArg : nextMonday();

  try {
    const result = (await generateWeekPlan(userId, weekStartDate)) as GenerateWeekResponse;
    const lines = result.plan.days.map(
      (d) => `${d.date}: ${d.total_calories}kcal / ${d.total_protein_g}g protein - ${d.workout.title}`
    );
    await bot.sendMessage(
      chatId,
      [`Week of ${result.plan.week_start_date}`, "", ...lines, "", result.summary].join("\n")
    );
  } catch (err) {
    await bot.sendMessage(
      chatId,
      `Could not generate the plan for week ${weekStartDate}: ${(err as Error).message}\n` +
        `Make sure you've uploaded a schedule for that week on the FitOS dashboard first.`
    );
  }
}
