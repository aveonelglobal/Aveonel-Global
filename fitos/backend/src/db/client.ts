import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env";

let cachedClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service role key.
 * Bypasses RLS - only ever used from trusted backend code, never exposed to clients.
 */
export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
    );
  }

  cachedClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}
