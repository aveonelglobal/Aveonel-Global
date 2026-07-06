import { getSupabase } from "../../db/client";
import { ProgressLogInput, UserProfile } from "../../types";
import { computeAdherenceScore } from "../../utils/nutrition";

/**
 * (G) Progress Tracker.
 * Upserts a day's log (weight/water/calories/protein/workout) and computes
 * an adherence score from how close the day landed to the user's targets.
 */
export async function logProgress(profile: UserProfile, input: ProgressLogInput) {
  const supabase = getSupabase();

  const adherenceScore = computeAdherenceScore({
    caloriesConsumed: input.calories_consumed,
    calorieTargetMin: profile.calorie_target_min,
    calorieTargetMax: profile.calorie_target_max,
    proteinConsumed: input.protein_consumed_g,
    proteinTargetMin: profile.protein_target_min,
    waterConsumedMl: input.water_intake_ml,
    waterTargetMl: profile.water_target_ml,
    workoutCompleted: input.workout_completed,
  });

  const { data, error } = await supabase
    .from("progress_logs")
    .upsert(
      {
        user_id: profile.id,
        log_date: input.log_date,
        weight_kg: input.weight_kg,
        water_intake_ml: input.water_intake_ml,
        calories_consumed: input.calories_consumed,
        protein_consumed_g: input.protein_consumed_g,
        workout_completed: input.workout_completed ?? false,
        adherence_score: adherenceScore,
        mood: input.mood,
        notes: input.notes,
      },
      { onConflict: "user_id,log_date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProgressForWeek(userId: string, weekStartDate: string) {
  const supabase = getSupabase();
  const weekEnd = new Date(`${weekStartDate}T00:00:00Z`);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  const { data, error } = await supabase
    .from("progress_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("log_date", weekStartDate)
    .lte("log_date", weekEnd.toISOString().slice(0, 10))
    .order("log_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Generates and persists the weekly rollup report used by the dashboard and
 * by the Telegram /week command.
 */
export async function generateWeeklyReport(userId: string, weekStartDate: string) {
  const supabase = getSupabase();
  const logs = await getProgressForWeek(userId, weekStartDate);

  const workouts = await supabase
    .from("workouts")
    .select("status")
    .eq("user_id", userId)
    .gte("workout_date", weekStartDate);

  const numLogs = logs.length || 1;
  const avgWeight = average(logs.map((l) => l.weight_kg).filter(isNum));
  const avgCalories = average(logs.map((l) => l.calories_consumed).filter(isNum));
  const avgProtein = average(logs.map((l) => l.protein_consumed_g).filter(isNum));
  const avgWater = average(logs.map((l) => l.water_intake_ml).filter(isNum));
  const overallAdherence = average(logs.map((l) => l.adherence_score).filter(isNum));

  const weightChange =
    logs.length >= 2 && isNum(logs[0].weight_kg) && isNum(logs[logs.length - 1].weight_kg)
      ? Math.round((logs[logs.length - 1].weight_kg - logs[0].weight_kg) * 100) / 100
      : null;

  const workoutRows = workouts.data ?? [];
  const workoutCompletionPct = workoutRows.length
    ? Math.round((workoutRows.filter((w) => w.status === "completed").length / workoutRows.length) * 1000) / 10
    : 0;

  const mealAdherencePct = Math.round((logs.length / numLogs) * 1000) / 10;

  const summary = buildSummary({
    weightChange,
    overallAdherence,
    workoutCompletionPct,
    avgWater,
  });

  const { data, error } = await supabase
    .from("weekly_reports")
    .upsert(
      {
        user_id: userId,
        week_start_date: weekStartDate,
        avg_weight_kg: avgWeight,
        weight_change_kg: weightChange,
        avg_calories: avgCalories ? Math.round(avgCalories) : null,
        avg_protein_g: avgProtein,
        avg_water_ml: avgWater ? Math.round(avgWater) : null,
        workout_completion_pct: workoutCompletionPct,
        meal_adherence_pct: mealAdherencePct,
        overall_adherence_score: overallAdherence,
        summary,
      },
      { onConflict: "user_id,week_start_date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

function isNum(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

function buildSummary(params: {
  weightChange: number | null;
  overallAdherence: number | null;
  workoutCompletionPct: number;
  avgWater: number | null;
}): string {
  const parts: string[] = [];
  if (params.weightChange !== null) {
    const direction = params.weightChange < 0 ? "down" : params.weightChange > 0 ? "up" : "unchanged";
    parts.push(`Weight ${direction} ${Math.abs(params.weightChange)}kg this week.`);
  }
  if (params.overallAdherence !== null) {
    parts.push(`Overall adherence: ${params.overallAdherence}%.`);
  }
  parts.push(`Workout completion: ${params.workoutCompletionPct}%.`);
  if (params.avgWater !== null) {
    parts.push(`Average water intake: ${Math.round(params.avgWater)}ml/day.`);
  }
  return parts.join(" ");
}
