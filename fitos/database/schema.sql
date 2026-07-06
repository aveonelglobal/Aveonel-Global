-- =====================================================================================
-- FitOS Database Schema (Supabase / PostgreSQL)
-- =====================================================================================
-- Personal AI health operating system.
-- Run this file against a Supabase Postgres database (SQL editor or `psql`).
-- Designed to work with Supabase Auth (auth.users) and Row Level Security (RLS).
-- =====================================================================================

create extension if not exists "pgcrypto";

-- =====================================================================================
-- USERS
-- =====================================================================================
-- Profile data extends Supabase's built-in auth.users table (1:1 via id).
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text,
  height_cm numeric(5, 2) not null default 150.0,     -- 4'11" ~ 150 cm
  weight_kg numeric(5, 2) not null default 62.0,
  goal text not null default 'fat_loss' check (goal in ('fat_loss', 'maintenance', 'muscle_gain', 'health_improvement')),
  diet_type text not null default 'gujarati_vegetarian' check (diet_type in ('gujarati_vegetarian', 'vegetarian', 'vegan')),
  excludes text[] not null default array['egg', 'meat', 'fish'],
  calorie_target_min integer not null default 1300,
  calorie_target_max integer not null default 1500,
  protein_target_min integer not null default 70,
  protein_target_max integer not null default 90,
  water_target_ml integer not null default 2500,
  cycle_tracking_enabled boolean not null default true,
  commute_minutes integer not null default 90,
  timezone text not null default 'Asia/Kolkata',
  telegram_chat_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================================
-- MENSTRUAL CYCLE LOGS (drives adaptive nutrition logic for irregular cycles)
-- =====================================================================================
create table if not exists public.cycle_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  log_date date not null,
  phase text check (phase in ('menstrual', 'follicular', 'ovulation', 'luteal', 'unknown')) default 'unknown',
  flow_intensity text check (flow_intensity in ('none', 'light', 'medium', 'heavy')),
  symptoms text[] default array[]::text[],
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- =====================================================================================
-- SCHEDULES  (weekly schedule input - the ONLY manual input the user provides)
-- =====================================================================================
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  week_start_date date not null,             -- Monday of the week this schedule applies to
  status text not null default 'active' check (status in ('draft', 'active', 'superseded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

-- One row per day of the week within a schedule.
create table if not exists public.schedule_days (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Monday .. 6 = Sunday
  work_start time,             -- null = day off / no fixed work
  work_end time,
  commute_minutes_override integer,   -- overrides user default commute if provided
  is_day_off boolean not null default false,
  is_travel_day boolean not null default false,
  energy_level text not null default 'normal' check (energy_level in ('low', 'normal', 'high')),
  notes text,
  created_at timestamptz not null default now(),
  unique (schedule_id, day_of_week)
);

-- Normalized free/busy time blocks derived from schedule_days (used by the planner).
create table if not exists public.schedule_time_blocks (
  id uuid primary key default gen_random_uuid(),
  schedule_day_id uuid not null references public.schedule_days (id) on delete cascade,
  block_type text not null check (block_type in ('work', 'commute', 'free', 'sleep')),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

-- =====================================================================================
-- RECIPES  (Gujarati vegetarian recipe library, seeded with 50+ entries)
-- =====================================================================================
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null check (category in ('breakfast', 'lunch', 'dinner', 'snack', 'beverage')),
  cuisine text not null default 'gujarati',
  ingredients jsonb not null,        -- [{ "name": "toor dal", "quantity": "1/2 cup", "category": "pulses" }]
  instructions text[] not null default array[]::text[],
  calories integer not null,
  protein_g numeric(5, 2) not null,
  carbs_g numeric(5, 2),
  fat_g numeric(5, 2),
  fiber_g numeric(5, 2),
  prep_time_min integer not null default 10,
  cook_time_min integer not null default 15,
  soak_required boolean not null default false,
  soak_time_min integer default 0,
  lunchbox_suitable boolean not null default false,
  portable boolean not null default false,        -- suitable for long commute / eat-on-the-go
  weekday_suitable boolean not null default true,
  weekend_suitable boolean not null default true,
  batch_cookable boolean not null default false,   -- good for free-day batch cooking
  spice_level text not null default 'medium' check (spice_level in ('mild', 'medium', 'spicy')),
  season text[] not null default array['all']::text[],
  tags text[] not null default array[]::text[],
  created_at timestamptz not null default now()
);

create index if not exists idx_recipes_category on public.recipes (category);
create index if not exists idx_recipes_prep_time on public.recipes (prep_time_min);

-- =====================================================================================
-- MEAL PLANS  (weekly container) and MEALS (individual planned meals)
-- =====================================================================================
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  schedule_id uuid references public.schedules (id) on delete set null,
  week_start_date date not null,
  total_calories_target integer not null,
  total_protein_target integer not null,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  generated_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  recipe_id uuid references public.recipes (id) on delete set null,
  meal_date date not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'dinner', 'snack_am', 'snack_pm')),
  scheduled_time time,
  calories integer not null,
  protein_g numeric(5, 2) not null,
  status text not null default 'planned' check (status in ('planned', 'eaten', 'skipped', 'swapped')),
  swap_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_meals_user_date on public.meals (user_id, meal_date);
create index if not exists idx_meals_plan on public.meals (meal_plan_id);

-- =====================================================================================
-- GROCERY LIST
-- =====================================================================================
create table if not exists public.grocery_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  meal_plan_id uuid references public.meal_plans (id) on delete cascade,
  week_start_date date not null,
  status text not null default 'pending' check (status in ('pending', 'shopping', 'completed')),
  created_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

create table if not exists public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  grocery_list_id uuid not null references public.grocery_lists (id) on delete cascade,
  name text not null,
  category text not null check (category in ('vegetables', 'fruits', 'dairy', 'grains', 'pulses', 'spices', 'condiments', 'other')),
  quantity text not null,
  unit text,
  is_pantry_staple boolean not null default false,
  already_in_pantry boolean not null default false,
  purchased boolean not null default false,
  source_recipe_ids uuid[] default array[]::uuid[],
  created_at timestamptz not null default now()
);

create index if not exists idx_grocery_items_list on public.grocery_items (grocery_list_id);

-- Pantry inventory - lets the grocery generator know what's already on hand / expiring.
create table if not exists public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  category text not null check (category in ('vegetables', 'fruits', 'dairy', 'grains', 'pulses', 'spices', 'condiments', 'other')),
  quantity text,
  expires_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pantry_user on public.pantry_items (user_id);

-- =====================================================================================
-- REMINDERS
-- =====================================================================================
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  reminder_date date not null,
  reminder_time time not null,
  reminder_type text not null check (reminder_type in ('water', 'meal', 'workout', 'night_prep', 'sleep', 'cycle_check_in')),
  title text not null,
  message text not null,
  payload jsonb default '{}'::jsonb,   -- structured data for automation triggers (e.g. { "meal_slot": "dinner", "recipe_id": "..." })
  channel text not null default 'telegram' check (channel in ('telegram', 'push', 'email')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'acknowledged', 'skipped', 'failed')),
  sent_at timestamptz,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_reminders_user_date on public.reminders (user_id, reminder_date);
create index if not exists idx_reminders_status_time on public.reminders (status, reminder_date, reminder_time);

-- =====================================================================================
-- WORKOUTS
-- =====================================================================================
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  workout_date date not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  workout_type text not null check (workout_type in ('walk', 'home_workout', 'rest', 'yoga', 'stretch')),
  title text not null,
  description text,
  exercises jsonb not null default '[]'::jsonb,   -- [{ "name": "Jumping Jacks", "duration_min": 5, "reps": null }]
  duration_min integer not null,
  intensity text not null default 'moderate' check (intensity in ('low', 'moderate', 'high')),
  scheduled_time time,
  status text not null default 'planned' check (status in ('planned', 'completed', 'skipped')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, workout_date)
);

create index if not exists idx_workouts_user_date on public.workouts (user_id, workout_date);

-- =====================================================================================
-- PROGRESS LOGS
-- =====================================================================================
create table if not exists public.progress_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  log_date date not null,
  weight_kg numeric(5, 2),
  water_intake_ml integer default 0,
  calories_consumed integer default 0,
  protein_consumed_g numeric(5, 2) default 0,
  workout_completed boolean default false,
  adherence_score numeric(5, 2),     -- 0-100, computed from meals/workout/water adherence
  mood text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists idx_progress_user_date on public.progress_logs (user_id, log_date);

-- Weekly rollup report (materialized on demand by the Progress Tracker module).
create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  week_start_date date not null,
  avg_weight_kg numeric(5, 2),
  weight_change_kg numeric(5, 2),
  avg_calories integer,
  avg_protein_g numeric(5, 2),
  avg_water_ml integer,
  workout_completion_pct numeric(5, 2),
  meal_adherence_pct numeric(5, 2),
  overall_adherence_score numeric(5, 2),
  summary text,
  generated_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

-- =====================================================================================
-- updated_at triggers
-- =====================================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists trg_schedules_updated_at on public.schedules;
create trigger trg_schedules_updated_at before update on public.schedules
  for each row execute function public.set_updated_at();

drop trigger if exists trg_pantry_updated_at on public.pantry_items;
create trigger trg_pantry_updated_at before update on public.pantry_items
  for each row execute function public.set_updated_at();

drop trigger if exists trg_progress_updated_at on public.progress_logs;
create trigger trg_progress_updated_at before update on public.progress_logs
  for each row execute function public.set_updated_at();

-- =====================================================================================
-- Row Level Security
-- =====================================================================================
alter table public.users enable row level security;
alter table public.cycle_logs enable row level security;
alter table public.schedules enable row level security;
alter table public.schedule_days enable row level security;
alter table public.schedule_time_blocks enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meals enable row level security;
alter table public.grocery_lists enable row level security;
alter table public.grocery_items enable row level security;
alter table public.pantry_items enable row level security;
alter table public.reminders enable row level security;
alter table public.workouts enable row level security;
alter table public.progress_logs enable row level security;
alter table public.weekly_reports enable row level security;
-- recipes are a shared read-only library, RLS not required for select-all use cases.
alter table public.recipes enable row level security;

create policy "Users manage own profile" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Recipes are readable by any authenticated user" on public.recipes
  for select using (auth.role() = 'authenticated');

create policy "Users manage own cycle logs" on public.cycle_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own schedules" on public.schedules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own schedule days" on public.schedule_days
  for all using (
    exists (select 1 from public.schedules s where s.id = schedule_id and s.user_id = auth.uid())
  );

create policy "Users manage own schedule time blocks" on public.schedule_time_blocks
  for all using (
    exists (
      select 1 from public.schedule_days sd
      join public.schedules s on s.id = sd.schedule_id
      where sd.id = schedule_day_id and s.user_id = auth.uid()
    )
  );

create policy "Users manage own meal plans" on public.meal_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own meals" on public.meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own grocery lists" on public.grocery_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own grocery items" on public.grocery_items
  for all using (
    exists (select 1 from public.grocery_lists gl where gl.id = grocery_list_id and gl.user_id = auth.uid())
  );

create policy "Users manage own pantry" on public.pantry_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own reminders" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own workouts" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own progress logs" on public.progress_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own weekly reports" on public.weekly_reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
