import TelegramBot from "node-telegram-bot-api";
import { config } from "./config";
import { resolveUserByChatId } from "./api";
import { handleLink } from "./commands/link";
import { handleToday } from "./commands/today";
import { handleWeek } from "./commands/week";
import { handleLog } from "./commands/log";

const bot = new TelegramBot(config.botToken, { polling: true });

console.log("FitOS Telegram bot started (polling)...");

bot.onText(/^\/start/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
    "Welcome to FitOS. First, link your account: /link <your-fitos-user-id>\n" +
      "Find your user ID on the FitOS dashboard under Settings."
  );
});

bot.onText(/^\/link(?:\s+(\S+))?/, async (msg, match) => {
  await handleLink(bot, msg, match?.[1]);
});

async function withLinkedUser(
  msg: TelegramBot.Message,
  fn: (userId: string) => Promise<void>
): Promise<void> {
  const chatId = msg.chat.id;
  const userId = await resolveUserByChatId(String(chatId));
  if (!userId) {
    await bot.sendMessage(chatId, "You're not linked yet. Send /link <your-fitos-user-id> first.");
    return;
  }
  try {
    await fn(userId);
  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, `Something went wrong: ${(err as Error).message}`);
  }
}

bot.onText(/^\/today/, async (msg) => {
  await withLinkedUser(msg, (userId) => handleToday(bot, msg.chat.id, userId));
});

bot.onText(/^\/week(?:\s+(\S+))?/, async (msg, match) => {
  await withLinkedUser(msg, (userId) => handleWeek(bot, msg.chat.id, userId, match?.[1]));
});

bot.onText(/^\/log(?:\s+(.+))?/, async (msg, match) => {
  const args = (match?.[1] ?? "").trim().split(/\s+/).filter(Boolean);
  await withLinkedUser(msg, (userId) => handleLog(bot, msg.chat.id, userId, args));
});

bot.on("polling_error", (err) => console.error("Telegram polling error:", err));
