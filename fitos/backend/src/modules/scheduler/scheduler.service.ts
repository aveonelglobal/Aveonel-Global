import { getSupabase } from "../../db/client";
import { NormalizedScheduleDay, UserProfile, WeeklyScheduleInput } from "../../types";
import { normalizeScheduleDay } from "../../utils/time";

export class ScheduleValidationError extends Error {}

function validateWeeklyScheduleInput(input: WeeklyScheduleInput): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.week_start_date)) {
    throw new ScheduleValidationError("week_start_date must be an ISO date (YYYY-MM-DD)");
  }
  const weekday = new Date(`${input.week_start_date}T00:00:00Z`).getUTCDay();
  // getUTCDay: 0 = Sunday .. 6 = Saturday. We require Monday (1).
  if (weekday !== 1) {
    throw new ScheduleValidationError("week_start_date must fall on a Monday");
  }
  if (!Array.isArray(input.days) || input.days.length !== 7) {
    throw new ScheduleValidationError("days must contain exactly 7 entries (Monday..Sunday)");
  }
  const seen = new Set<number>();
  for (const day of input.days) {
    if (day.day_of_week < 0 || day.day_of_week > 6) {
      throw new ScheduleValidationError(`invalid day_of_week: ${day.day_of_week}`);
    }
    if (seen.has(day.day_of_week)) {
      throw new ScheduleValidationError(`duplicate day_of_week: ${day.day_of_week}`);
    }
    seen.add(day.day_of_week);
    if (!day.is_day_off) {
      if (day.work_start && day.work_end && day.work_start >= day.work_end) {
        throw new ScheduleValidationError(`day ${day.day_of_week}: work_start must be before work_end`);
      }
    }
  }
}

/**
 * Persists the user's weekly schedule input and immediately normalizes it into
 * time blocks the rest of the system (meal planner, workout engine, reminders)
 * consumes. This is the ONLY manual input step in the whole product.
 */
export async function uploadSchedule(
  userId: string,
  profile: Pick<UserProfile, "commute_minutes">,
  input: WeeklyScheduleInput
): Promise<{ scheduleId: string; normalizedDays: NormalizedScheduleDay[] }> {
  validateWeeklyScheduleInput(input);
  const supabase = getSupabase();

  // Supersede any previous active schedule for this week (idempotent re-upload).
  await supabase
    .from("schedules")
    .update({ status: "superseded" })
    .eq("user_id", userId)
    .eq("week_start_date", input.week_start_date)
    .eq("status", "active");

  const { data: schedule, error: scheduleErr } = await supabase
    .from("schedules")
    .insert({ user_id: userId, week_start_date: input.week_start_date, status: "active" })
    .select()
    .single();
  if (scheduleErr) throw scheduleErr;

  const normalizedDays: NormalizedScheduleDay[] = [];

  for (const day of input.days) {
    const { data: scheduleDay, error: dayErr } = await supabase
      .from("schedule_days")
      .insert({
        schedule_id: schedule.id,
        day_of_week: day.day_of_week,
        work_start: day.work_start ?? null,
        work_end: day.work_end ?? null,
        commute_minutes_override: day.commute_minutes_override ?? null,
        is_day_off: day.is_day_off ?? false,
        is_travel_day: day.is_travel_day ?? false,
        energy_level: day.energy_level ?? "normal",
        notes: day.notes ?? null,
      })
      .select()
      .single();
    if (dayErr) throw dayErr;

    const normalized = normalizeScheduleDay(day, profile.commute_minutes);
    normalizedDays.push(normalized);

    if (normalized.blocks.length > 0) {
      const { error: blocksErr } = await supabase.from("schedule_time_blocks").insert(
        normalized.blocks.map((b) => ({
          schedule_day_id: scheduleDay.id,
          block_type: b.block_type,
          start_time: b.start_time,
          end_time: b.end_time,
        }))
      );
      if (blocksErr) throw blocksErr;
    }
  }

  return { scheduleId: schedule.id, normalizedDays };
}

export async function getActiveSchedule(
  userId: string,
  weekStartDate: string
): Promise<{ scheduleId: string; days: Array<{ day_of_week: number } & Record<string, unknown>> } | null> {
  const supabase = getSupabase();
  const { data: schedule, error } = await supabase
    .from("schedules")
    .select("id, week_start_date, schedule_days(*)")
    .eq("user_id", userId)
    .eq("week_start_date", weekStartDate)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  if (!schedule) return null;

  return {
    scheduleId: schedule.id,
    days: (schedule as unknown as { schedule_days: Array<{ day_of_week: number }> }).schedule_days,
  };
}
