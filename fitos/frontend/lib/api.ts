import { supabase } from "./supabaseClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_FITOS_API_BASE_URL ?? "http://localhost:4000/api";

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}`, "content-type": "application/json" };
}

async function request<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers = await authHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${opts.method ?? "GET"} ${path} failed (${response.status}): ${text}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// --- Types mirroring backend/src/types (kept in sync manually - see docs/API.md) ---

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  height_cm: number;
  weight_kg: number;
  goal: string;
  diet_type: string;
  calorie_target_min: number;
  calorie_target_max: number;
  protein_target_min: number;
  protein_target_max: number;
  water_target_ml: number;
  cycle_tracking_enabled: boolean;
  commute_minutes: number;
  telegram_chat_id?: string | null;
}

export interface ScheduleDayInput {
  day_of_week: number;
  work_start?: string | null;
  work_end?: string | null;
  is_day_off?: boolean;
  is_travel_day?: boolean;
  energy_level?: "low" | "normal" | "high";
}

export interface DashboardMeal {
  id: string;
  meal_slot: string;
  scheduled_time?: string | null;
  calories: number;
  protein_g: number;
  status: string;
  recipes?: { name: string; calories: number; protein_g: number } | null;
}

export interface DashboardResponse {
  date: string;
  week_start_date: string;
  profile: UserProfile;
  today: {
    meals: DashboardMeal[];
    workout: { title: string; description: string; duration_min: number; intensity: string; workout_type: string } | null;
    reminders: Array<{ id: string; reminder_time: string; reminder_type: string; title: string; message: string }>;
    progress: { weight_kg?: number; water_intake_ml?: number; calories_consumed?: number; adherence_score?: number } | null;
  };
  week: {
    progress_logs: Array<{ log_date: string; weight_kg?: number; adherence_score?: number }>;
    report: { summary: string; workout_completion_pct: number; overall_adherence_score: number } | null;
  };
  grocery_list: { id: string; status: string; total_items: number; purchased_items: number } | null;
}

export interface WeeklyPlanDay {
  date: string;
  day_of_week: number;
  meals: Array<{ meal_slot: string; recipe_name: string; calories: number; protein_g: number; scheduled_time?: string | null }>;
  total_calories: number;
  total_protein_g: number;
  workout: { title: string; duration_min: number; intensity: string };
}

export interface GenerateWeekPlanResponse {
  mealPlanId: string;
  plan: { week_start_date: string; days: WeeklyPlanDay[]; total_calories_target: number; total_protein_target: number };
  groceryListId: string;
  summary: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  already_in_pantry: boolean;
  purchased: boolean;
}

export const api = {
  me: () => request<UserProfile>("/me"),
  updateProfile: (patch: Partial<UserProfile>) => request<UserProfile>("/me", { method: "PATCH", body: patch }),
  uploadSchedule: (weekStartDate: string, days: ScheduleDayInput[]) =>
    request("/upload-schedule", { method: "POST", body: { week_start_date: weekStartDate, days } }),
  generateWeekPlan: (weekStartDate: string) =>
    request<GenerateWeekPlanResponse>("/generate-week-plan", { method: "POST", body: { week_start_date: weekStartDate } }),
  getDashboard: (date?: string) => request<DashboardResponse>(`/get-dashboard${date ? `?date=${date}` : ""}`),
  logProgress: (body: Record<string, unknown>) => request("/log-progress", { method: "POST", body }),
  generateGroceryList: (weekStartDate: string) =>
    request<{ items_by_category: Record<string, GroceryItem[]>; total_items: number }>("/generate-grocery-list", {
      method: "POST",
      body: { week_start_date: weekStartDate },
    }),
  getGroceryList: (weekStartDate: string) =>
    request<{ id: string; status: string; grocery_items: GroceryItem[] } | null>(
      `/grocery-list?week_start_date=${weekStartDate}`
    ),
  listRecipes: (category?: string) => request(`/recipes${category ? `?category=${category}` : ""}`),
};
