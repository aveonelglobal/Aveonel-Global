import { NormalizedScheduleDay, ScheduleDayInput, TimeBlock } from "../types";

const DAY_START = "06:00";
const DAY_SLEEP_START = "22:30";
const MINUTES_PER_DAY = 24 * 60;

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function toHHMM(minutes: number): string {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function addMinutes(hhmm: string, delta: number): string {
  return toHHMM(toMinutes(hhmm) + delta);
}

/**
 * Turns a single day's raw schedule input into normalized time blocks
 * (work / commute / free / sleep) plus derived flags the meal planner,
 * workout engine and reminder system all key off of.
 */
export function normalizeScheduleDay(
  input: ScheduleDayInput,
  defaultCommuteMinutes: number
): NormalizedScheduleDay {
  const blocks: TimeBlock[] = [];
  const commuteMinutes = input.commute_minutes_override ?? defaultCommuteMinutes;

  if (input.is_day_off || !input.work_start || !input.work_end) {
    blocks.push({ block_type: "free", start_time: DAY_START, end_time: DAY_SLEEP_START });
  } else {
    const workStartMin = toMinutes(input.work_start);
    const workEndMin = toMinutes(input.work_end);
    const dayStartMin = toMinutes(DAY_START);
    const sleepStartMin = toMinutes(DAY_SLEEP_START);
    const halfCommute = Math.ceil(commuteMinutes / 2);

    const commuteOutStart = Math.max(dayStartMin, workStartMin - halfCommute);
    const commuteOutEnd = workStartMin;
    const commuteInStart = workEndMin;
    const commuteInEnd = workEndMin + halfCommute;

    if (commuteOutStart > dayStartMin) {
      blocks.push({ block_type: "free", start_time: toHHMM(dayStartMin), end_time: toHHMM(commuteOutStart) });
    }
    if (halfCommute > 0) {
      blocks.push({ block_type: "commute", start_time: toHHMM(commuteOutStart), end_time: toHHMM(commuteOutEnd) });
    }
    blocks.push({ block_type: "work", start_time: toHHMM(workStartMin), end_time: toHHMM(workEndMin) });
    if (halfCommute > 0) {
      blocks.push({ block_type: "commute", start_time: toHHMM(commuteInStart), end_time: toHHMM(commuteInEnd) });
    }
    if (commuteInEnd < sleepStartMin) {
      blocks.push({ block_type: "free", start_time: toHHMM(commuteInEnd), end_time: toHHMM(sleepStartMin) });
    }
  }

  blocks.push({ block_type: "sleep", start_time: DAY_SLEEP_START, end_time: DAY_START });

  const freeBlocks = blocks.filter((b) => b.block_type === "free");
  const freeMinutes = freeBlocks.reduce((sum, b) => sum + (toMinutes(b.end_time) - toMinutes(b.start_time)), 0);
  const longestFreeBlockMin = freeBlocks.reduce(
    (max, b) => Math.max(max, toMinutes(b.end_time) - toMinutes(b.start_time)),
    0
  );

  const isLateFinish = !input.is_day_off && !!input.work_end && toMinutes(input.work_end) >= toMinutes("20:00");
  const isLongCommute = commuteMinutes > 60;

  return {
    ...input,
    blocks,
    free_minutes: freeMinutes,
    longest_free_block_min: longestFreeBlockMin,
    commute_minutes: commuteMinutes,
    is_late_finish: isLateFinish,
    is_long_commute: isLongCommute,
  };
}

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function dateForDayOfWeek(weekStartDate: string, dayOfWeek: number): string {
  const d = new Date(`${weekStartDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dayOfWeek);
  return d.toISOString().slice(0, 10);
}

/** Returns the Monday (ISO date) of the week containing the given date. */
export function getWeekStartForDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const jsDay = d.getUTCDay(); // 0 = Sunday .. 6 = Saturday
  const daysSinceMonday = jsDay === 0 ? 6 : jsDay - 1;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d.toISOString().slice(0, 10);
}

/** Day-of-week index (0=Monday..6=Sunday) for a given ISO date. */
export function dayOfWeekForDate(dateStr: string): number {
  const jsDay = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}
