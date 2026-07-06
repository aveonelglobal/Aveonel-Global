import { NormalizedScheduleDay, WorkoutPlan } from "../../types";
import { DAY_NAMES } from "../../utils/time";

interface WorkoutGenParams {
  day: NormalizedScheduleDay;
  date: string;
}

const HOME_WORKOUT_LIBRARY: Record<"low" | "moderate" | "high", Array<{ name: string; duration_min?: number; reps?: string }>> = {
  low: [
    { name: "Standing side stretch", duration_min: 2 },
    { name: "Cat-cow stretch", duration_min: 3 },
    { name: "Seated forward bend", duration_min: 3 },
    { name: "Deep breathing (pranayama)", duration_min: 5 },
    { name: "Neck and shoulder rolls", duration_min: 2 },
  ],
  moderate: [
    { name: "Jumping jacks", duration_min: 3 },
    { name: "Bodyweight squats", reps: "3 sets x 15" },
    { name: "Wall push-ups", reps: "3 sets x 12" },
    { name: "Standing knee raises", reps: "3 sets x 15 each side" },
    { name: "Plank hold", duration_min: 3 },
    { name: "Surya Namaskar (Sun Salutation)", reps: "4 rounds" },
  ],
  high: [
    { name: "Jumping jacks", duration_min: 5 },
    { name: "Bodyweight squats", reps: "4 sets x 20" },
    { name: "Push-ups (knee or full)", reps: "4 sets x 12" },
    { name: "Lunges", reps: "3 sets x 12 each leg" },
    { name: "Mountain climbers", duration_min: 3 },
    { name: "Plank hold", duration_min: 4 },
    { name: "Surya Namaskar (Sun Salutation)", reps: "6 rounds" },
  ],
};

/**
 * (F) Workout Engine.
 * Chooses workout type/intensity from available free time and the
 * schedule-implied energy level for the day, with explicit rest-day logic.
 */
export function generateDailyWorkout(params: WorkoutGenParams): WorkoutPlan {
  const { day, date } = params;
  const dayName = DAY_NAMES[day.day_of_week];

  // Rest day logic: explicit day off from work doesn't necessarily mean rest -
  // but very low free time, travel days, or an explicitly low energy level do.
  if (day.is_travel_day) {
    return {
      workout_date: date,
      day_of_week: day.day_of_week,
      workout_type: "rest",
      title: `${dayName}: Travel Day - Active Rest`,
      description:
        "Travel day. Prioritize hydration and light mobility instead of a structured workout.",
      exercises: [{ name: "Ankle circles / seated stretches during travel", duration_min: 5 }],
      duration_min: 5,
      intensity: "low",
      scheduled_time: null,
    };
  }

  if (day.energy_level === "low" && day.free_minutes < 30) {
    return {
      workout_date: date,
      day_of_week: day.day_of_week,
      workout_type: "rest",
      title: `${dayName}: Rest Day`,
      description: "Low energy and minimal free time today - full rest to support recovery and adherence.",
      exercises: [],
      duration_min: 0,
      intensity: "low",
      scheduled_time: null,
    };
  }

  // Long free block (free day / weekend) -> longer walk + fuller home workout.
  if (day.is_day_off || day.longest_free_block_min >= 240) {
    return {
      workout_date: date,
      day_of_week: day.day_of_week,
      workout_type: "walk",
      title: `${dayName}: Long Walk + Home Workout`,
      description: "Free day - combine a longer brisk walk with a fuller bodyweight home workout.",
      exercises: [
        { name: "Brisk walk", duration_min: 35 },
        ...HOME_WORKOUT_LIBRARY.high,
      ],
      duration_min: 35 + HOME_WORKOUT_LIBRARY.high.reduce((s, e) => s + (e.duration_min ?? 3), 0),
      intensity: "high",
      scheduled_time: "07:00",
    };
  }

  // Busy working day with a late finish - keep it short, low-impact, at home.
  if (day.is_late_finish || day.free_minutes < 90) {
    return {
      workout_date: date,
      day_of_week: day.day_of_week,
      workout_type: "stretch",
      title: `${dayName}: Quick Stretch & Mobility`,
      description: "Busy day with a late finish - a short low-intensity stretch routine keeps consistency without adding fatigue.",
      exercises: HOME_WORKOUT_LIBRARY.low,
      duration_min: HOME_WORKOUT_LIBRARY.low.reduce((s, e) => s + (e.duration_min ?? 2), 0),
      intensity: "low",
      scheduled_time: day.is_late_finish ? "21:30" : "19:00",
    };
  }

  // Default: normal working day, moderate energy -> 20-25 min walk + moderate home workout.
  return {
    workout_date: date,
    day_of_week: day.day_of_week,
    workout_type: "home_workout",
    title: `${dayName}: Walk + Home Workout`,
    description: "Standard working day - a brisk walk plus a moderate bodyweight circuit.",
    exercises: [{ name: "Brisk walk", duration_min: 20 }, ...HOME_WORKOUT_LIBRARY.moderate],
    duration_min: 20 + HOME_WORKOUT_LIBRARY.moderate.reduce((s, e) => s + (e.duration_min ?? 3), 0),
    intensity: "moderate",
    scheduled_time: "18:30",
  };
}
