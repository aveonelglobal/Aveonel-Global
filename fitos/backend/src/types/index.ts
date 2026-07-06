export type Goal = "fat_loss" | "maintenance" | "muscle_gain" | "health_improvement";
export type DietType = "gujarati_vegetarian" | "vegetarian" | "vegan";
export type EnergyLevel = "low" | "normal" | "high";
export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal" | "unknown";
export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack_am" | "snack_pm";
export type RecipeCategory = "breakfast" | "lunch" | "dinner" | "snack" | "beverage";
export type SpiceLevel = "mild" | "medium" | "spicy";
export type GroceryCategory =
  | "vegetables"
  | "fruits"
  | "dairy"
  | "grains"
  | "pulses"
  | "spices"
  | "condiments"
  | "other";
export type ReminderType = "water" | "meal" | "workout" | "night_prep" | "sleep" | "cycle_check_in";
export type WorkoutType = "walk" | "home_workout" | "rest" | "yoga" | "stretch";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  height_cm: number;
  weight_kg: number;
  goal: Goal;
  diet_type: DietType;
  excludes: string[];
  calorie_target_min: number;
  calorie_target_max: number;
  protein_target_min: number;
  protein_target_max: number;
  water_target_ml: number;
  cycle_tracking_enabled: boolean;
  commute_minutes: number;
  timezone: string;
  telegram_chat_id?: string | null;
}

export interface ScheduleDayInput {
  day_of_week: number; // 0 = Monday .. 6 = Sunday
  work_start?: string | null; // "HH:MM"
  work_end?: string | null;
  commute_minutes_override?: number | null;
  is_day_off?: boolean;
  is_travel_day?: boolean;
  energy_level?: EnergyLevel;
  notes?: string;
}

export interface WeeklyScheduleInput {
  week_start_date: string; // "YYYY-MM-DD", must be a Monday
  days: ScheduleDayInput[]; // exactly 7 entries, day_of_week 0..6
}

export interface TimeBlock {
  block_type: "work" | "commute" | "free" | "sleep";
  start_time: string; // "HH:MM"
  end_time: string;
}

export interface NormalizedScheduleDay extends ScheduleDayInput {
  blocks: TimeBlock[];
  free_minutes: number;
  longest_free_block_min: number;
  commute_minutes: number;
  is_late_finish: boolean; // work_end after 20:00
  is_long_commute: boolean; // commute > 60 min
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  category: GroceryCategory;
}

export interface Recipe {
  id: string;
  name: string;
  slug: string;
  category: RecipeCategory;
  cuisine: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  calories: number;
  protein_g: number;
  carbs_g?: number | null;
  fat_g?: number | null;
  fiber_g?: number | null;
  prep_time_min: number;
  cook_time_min: number;
  soak_required: boolean;
  soak_time_min?: number | null;
  lunchbox_suitable: boolean;
  portable: boolean;
  weekday_suitable: boolean;
  weekend_suitable: boolean;
  batch_cookable: boolean;
  spice_level: SpiceLevel;
  season: string[];
  tags: string[];
}

export interface PlannedMeal {
  meal_date: string;
  day_of_week: number;
  meal_slot: MealSlot;
  scheduled_time?: string | null;
  recipe_id: string;
  recipe_name: string;
  calories: number;
  protein_g: number;
  soak_required: boolean;
}

export interface DailyPlan {
  date: string;
  day_of_week: number;
  meals: PlannedMeal[];
  total_calories: number;
  total_protein_g: number;
  workout: WorkoutPlan;
  reminders: ReminderPlan[];
}

export interface WeeklyPlan {
  week_start_date: string;
  days: DailyPlan[];
  total_calories_target: number;
  total_protein_target: number;
}

export interface WorkoutPlan {
  workout_date: string;
  day_of_week: number;
  workout_type: WorkoutType;
  title: string;
  description: string;
  exercises: Array<{ name: string; duration_min?: number; reps?: string }>;
  duration_min: number;
  intensity: "low" | "moderate" | "high";
  scheduled_time?: string | null;
}

export interface ReminderPlan {
  reminder_date: string;
  reminder_time: string;
  reminder_type: ReminderType;
  title: string;
  message: string;
  payload: Record<string, unknown>;
  channel: "telegram" | "push" | "email";
}

export interface GroceryItemAggregate {
  name: string;
  category: GroceryCategory;
  quantity: string;
  already_in_pantry: boolean;
  source_recipe_ids: string[];
}

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  category: GroceryCategory;
  quantity?: string | null;
  expires_on?: string | null;
}

export interface ProgressLogInput {
  log_date: string;
  weight_kg?: number;
  water_intake_ml?: number;
  calories_consumed?: number;
  protein_consumed_g?: number;
  workout_completed?: boolean;
  mood?: string;
  notes?: string;
}
