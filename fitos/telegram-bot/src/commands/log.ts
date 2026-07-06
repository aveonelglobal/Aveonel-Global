import TelegramBot from "node-telegram-bot-api";
import { logProgress } from "../api";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * /log weight <kg>
 * /log food <calories> [protein_g]
 * /log water <ml>
 * /log workout done
 * Each subcommand upserts today's progress_logs row via /log-progress.
 */
export async function handleLog(bot: TelegramBot, chatId: number, userId: string, args: string[]): Promise<void> {
  const [subcommand, ...rest] = args;

  if (subcommand === "weight") {
    const kg = parseFloat(rest[0]);
    if (Number.isNaN(kg)) {
      await bot.sendMessage(chatId, "Usage: /log weight <kg>  e.g. /log weight 61.8");
      return;
    }
    await logProgress(userId, { log_date: today(), weight_kg: kg });
    await bot.sendMessage(chatId, `Logged weight: ${kg}kg for ${today()}.`);
    return;
  }

  if (subcommand === "food") {
    const calories = parseInt(rest[0], 10);
    const protein = rest[1] !== undefined ? parseFloat(rest[1]) : undefined;
    if (Number.isNaN(calories)) {
      await bot.sendMessage(chatId, "Usage: /log food <calories> [protein_g]  e.g. /log food 350 18");
      return;
    }
    await logProgress(userId, { log_date: today(), calories_consumed: calories, protein_consumed_g: protein });
    await bot.sendMessage(chatId, `Logged food: ${calories}kcal${protein !== undefined ? ` / ${protein}g protein` : ""} for ${today()}.`);
    return;
  }

  if (subcommand === "water") {
    const ml = parseInt(rest[0], 10);
    if (Number.isNaN(ml)) {
      await bot.sendMessage(chatId, "Usage: /log water <ml>  e.g. /log water 250");
      return;
    }
    await logProgress(userId, { log_date: today(), water_intake_ml: ml });
    await bot.sendMessage(chatId, `Logged water: +${ml}ml for ${today()}.`);
    return;
  }

  if (subcommand === "workout") {
    const completed = rest[0] !== "skip";
    await logProgress(userId, { log_date: today(), workout_completed: completed });
    await bot.sendMessage(chatId, `Logged workout as ${completed ? "completed" : "skipped"} for ${today()}.`);
    return;
  }

  await bot.sendMessage(
    chatId,
    "Usage:\n/log weight <kg>\n/log food <calories> [protein_g]\n/log water <ml>\n/log workout [done|skip]"
  );
}
