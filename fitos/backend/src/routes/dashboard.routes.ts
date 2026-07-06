import { Router } from "express";
import { getSupabase } from "../db/client";
import { getWeekStartForDate } from "../utils/time";
import { generateWeeklyReport, getProgressForWeek } from "../modules/progress/progress.service";

export const dashboardRouter = Router();

/**
 * GET /get-dashboard?date=YYYY-MM-DD (defaults to today)
 * Single call the frontend/Telegram bot use to render "what's happening now":
 * today's meals + workout + reminders, today's progress log, and the current
 * week's rollup report.
 */
dashboardRouter.get("/get-dashboard", async (req, res, next) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const weekStartDate = getWeekStartForDate(date);
    const userId = req.profile!.id;
    const supabase = getSupabase();

    const [mealsRes, workoutRes, remindersRes, progressRows, groceryRes] = await Promise.all([
      supabase
        .from("meals")
        .select("*, recipes(name, calories, protein_g)")
        .eq("user_id", userId)
        .eq("meal_date", date)
        .order("scheduled_time", { ascending: true }),
      supabase.from("workouts").select("*").eq("user_id", userId).eq("workout_date", date).maybeSingle(),
      supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId)
        .eq("reminder_date", date)
        .order("reminder_time", { ascending: true }),
      getProgressForWeek(userId, weekStartDate),
      supabase
        .from("grocery_lists")
        .select("id, status, grocery_items(purchased)")
        .eq("user_id", userId)
        .eq("week_start_date", weekStartDate)
        .maybeSingle(),
    ]);

    if (mealsRes.error) throw mealsRes.error;
    if (workoutRes.error) throw workoutRes.error;
    if (remindersRes.error) throw remindersRes.error;

    const weeklyReport = await generateWeeklyReport(userId, weekStartDate);
    const todayProgress = progressRows.find((p) => p.log_date === date) ?? null;

    const groceryItems = (groceryRes.data as unknown as { grocery_items?: Array<{ purchased: boolean }> } | null)
      ?.grocery_items;

    res.json({
      date,
      week_start_date: weekStartDate,
      profile: req.profile,
      today: {
        meals: mealsRes.data ?? [],
        workout: workoutRes.data ?? null,
        reminders: remindersRes.data ?? [],
        progress: todayProgress,
      },
      week: {
        progress_logs: progressRows,
        report: weeklyReport,
      },
      grocery_list: groceryRes.data
        ? {
            id: groceryRes.data.id,
            status: groceryRes.data.status,
            total_items: groceryItems?.length ?? 0,
            purchased_items: groceryItems?.filter((i) => i.purchased).length ?? 0,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});
