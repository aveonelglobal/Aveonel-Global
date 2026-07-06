import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  botToken: required("TELEGRAM_BOT_TOKEN"),
  apiBaseUrl: process.env.FITOS_API_BASE_URL ?? "http://localhost:4000/api",
  webhookSecret: required("FITOS_WEBHOOK_SECRET"),
};
