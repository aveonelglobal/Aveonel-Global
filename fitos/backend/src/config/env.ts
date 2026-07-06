import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "4000", 10),
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  webhookSecret: process.env.FITOS_WEBHOOK_SECRET ?? "change-me",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  isProduction: process.env.NODE_ENV === "production",
};

export function assertSupabaseConfigured(): void {
  required("SUPABASE_URL");
  required("SUPABASE_SERVICE_ROLE_KEY");
}
