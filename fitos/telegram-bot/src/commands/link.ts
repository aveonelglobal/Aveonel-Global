import TelegramBot from "node-telegram-bot-api";
import { linkChat } from "../api";

/**
 * /link <user_id>
 * One-time command a user runs after copying their FitOS user_id from the
 * dashboard's Settings page, so the bot can map their Telegram chat to their
 * profile for every other command and for reminder delivery.
 */
export async function handleLink(bot: TelegramBot, msg: TelegramBot.Message, userId: string | undefined): Promise<void> {
  const chatId = msg.chat.id;
  if (!userId) {
    await bot.sendMessage(chatId, "Usage: /link <your-fitos-user-id>\nFind your user ID on the FitOS dashboard under Settings.");
    return;
  }
  try {
    await linkChat(userId, String(chatId));
    await bot.sendMessage(chatId, "Linked! You can now use /today, /week, and /log.");
  } catch (err) {
    await bot.sendMessage(chatId, `Could not link that user ID: ${(err as Error).message}`);
  }
}
