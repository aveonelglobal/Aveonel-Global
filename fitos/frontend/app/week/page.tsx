"use client";

import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import { api, GenerateWeekPlanResponse } from "@/lib/api";

function nextMonday(): string {
  const now = new Date();
  const jsDay = now.getUTCDay();
  const daysUntilMonday = jsDay === 1 ? 0 : (8 - jsDay) % 7 || 7;
  now.setUTCDate(now.getUTCDate() + daysUntilMonday);
  return now.toISOString().slice(0, 10);
}

function WeekContent() {
  const [weekStartDate, setWeekStartDate] = useState(nextMonday());
  const [plan, setPlan] = useState<GenerateWeekPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadPlan() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.generateWeekPlan(weekStartDate);
      setPlan(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            Week starting:
            <input type="date" value={weekStartDate} onChange={(e) => setWeekStartDate(e.target.value)} className="input" />
          </label>
          <button onClick={loadPlan} disabled={loading} className="btn-primary">
            {loading ? "Generating..." : "Generate / refresh plan"}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-400">
            {error} - make sure you've uploaded a schedule for this week on the Schedule page.
          </p>
        )}
      </div>

      {plan && (
        <>
          <div className="card text-sm text-fitos-muted">{plan.summary}</div>
          {plan.plan.days.map((day) => (
            <div key={day.date} className="card">
              <div className="mb-2 flex justify-between">
                <h3 className="font-semibold">{day.date}</h3>
                <span className="text-sm text-fitos-muted">
                  {day.total_calories}kcal / {day.total_protein_g}g protein
                </span>
              </div>
              <ul className="mb-2 flex flex-col gap-1 text-sm">
                {day.meals.map((m, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {m.scheduled_time ?? "--:--"} - {m.meal_slot}: {m.recipe_name}
                    </span>
                    <span className="text-fitos-muted">
                      {m.calories}kcal / {m.protein_g}g
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-fitos-accent">
                Workout: {day.workout.title} ({day.workout.duration_min} min, {day.workout.intensity})
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function WeekPage() {
  return (
    <AuthGate>
      <WeekContent />
    </AuthGate>
  );
}
