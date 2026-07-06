import { config } from "./config";

/**
 * Thin client over the FitOS backend, authenticated as an automation caller
 * (webhook secret + user_id) rather than a browser session - exactly how
 * n8n's Telegram workflows talk to the backend too.
 */
async function request<T>(path: string, opts: { method?: string; userId?: string; body?: unknown } = {}): Promise<T> {
  const { method = "GET", userId, body } = opts;
  const url = new URL(`${config.apiBaseUrl}${path}`);

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-fitos-webhook-secret": config.webhookSecret,
  };

  let finalBody = body;
  if (userId && method === "GET") {
    url.searchParams.set("user_id", userId);
  } else if (userId) {
    finalBody = { ...(body as Record<string, unknown> | undefined), user_id: userId };
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: finalBody ? JSON.stringify(finalBody) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FitOS API ${method} ${path} failed: ${response.status} ${text}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export interface ResolvedUser {
  user_id: string;
}

export async function resolveUserByChatId(chatId: string): Promise<string | null> {
  try {
    const result = await request<ResolvedUser>(`/telegram/resolve?chat_id=${encodeURIComponent(chatId)}`);
    return result.user_id;
  } catch {
    return null;
  }
}

export async function linkChat(userId: string, chatId: string): Promise<void> {
  await request(`/telegram/link`, { method: "POST", body: { user_id: userId, chat_id: chatId } });
}

export function getDashboard(userId: string, date?: string) {
  return request(`/get-dashboard${date ? `?date=${date}` : ""}`, { userId });
}

export function logProgress(userId: string, body: Record<string, unknown>) {
  return request(`/log-progress`, { method: "POST", userId, body });
}

export function generateWeekPlan(userId: string, weekStartDate: string) {
  return request(`/generate-week-plan`, { method: "POST", userId, body: { week_start_date: weekStartDate } });
}
