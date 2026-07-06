"use client";

import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import { api, ScheduleDayInput } from "@/lib/api";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function nextMonday(): string {
  const now = new Date();
  const jsDay = now.getUTCDay();
  const daysUntilMonday = jsDay === 1 ? 0 : (8 - jsDay) % 7 || 7;
  now.setUTCDate(now.getUTCDate() + daysUntilMonday);
  return now.toISOString().slice(0, 10);
}

function defaultDays(): ScheduleDayInput[] {
  return DAY_NAMES.map((_, i) => ({
    day_of_week: i,
    work_start: i < 5 ? "09:30" : null,
    work_end: i < 5 ? "18:30" : null,
    is_day_off: i >= 5,
    is_travel_day: false,
    energy_level: "normal",
  }));
}

function ScheduleForm() {
  const [weekStartDate, setWeekStartDate] = useState(nextMonday());
  const [days, setDays] = useState<ScheduleDayInput[]>(defaultDays());
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateDay(index: number, patch: Partial<ScheduleDayInput>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  async function submit() {
    setSubmitting(true);
    setStatus(null);
    try {
      await api.uploadSchedule(weekStartDate, days);
      setStatus("Schedule uploaded. Generating this week's plan...");
      await api.generateWeekPlan(weekStartDate);
      setStatus("Done! Your meals, workouts, reminders and grocery list are ready - check the Today and Week tabs.");
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <h2 className="mb-1 text-lg font-semibold">Weekly schedule</h2>
        <p className="mb-4 text-sm text-fitos-muted">
          This is the only thing FitOS ever needs from you manually. Everything else - meals, groceries, workouts,
          reminders - is generated automatically from this.
        </p>
        <label className="mb-4 flex items-center gap-2 text-sm">
          Week starting (Monday):
          <input type="date" value={weekStartDate} onChange={(e) => setWeekStartDate(e.target.value)} className="input" />
        </label>

        <div className="flex flex-col gap-3">
          {days.map((day, i) => (
            <div key={i} className="grid grid-cols-2 items-center gap-2 border-b border-[#24312a] pb-3 last:border-0 sm:grid-cols-6">
              <span className="col-span-2 text-sm font-medium sm:col-span-1">{DAY_NAMES[i]}</span>

              <label className="col-span-2 flex items-center gap-1 text-xs text-fitos-muted sm:col-span-1">
                <input
                  type="checkbox"
                  checked={!!day.is_day_off}
                  onChange={(e) => updateDay(i, { is_day_off: e.target.checked })}
                />
                Day off
              </label>

              {!day.is_day_off && (
                <>
                  <input
                    type="time"
                    value={day.work_start ?? ""}
                    onChange={(e) => updateDay(i, { work_start: e.target.value })}
                    className="input"
                  />
                  <input
                    type="time"
                    value={day.work_end ?? ""}
                    onChange={(e) => updateDay(i, { work_end: e.target.value })}
                    className="input"
                  />
                </>
              )}

              <label className="flex items-center gap-1 text-xs text-fitos-muted">
                <input
                  type="checkbox"
                  checked={!!day.is_travel_day}
                  onChange={(e) => updateDay(i, { is_travel_day: e.target.checked })}
                />
                Travel day
              </label>

              <select
                value={day.energy_level}
                onChange={(e) => updateDay(i, { energy_level: e.target.value as ScheduleDayInput["energy_level"] })}
                className="input"
              >
                <option value="low">Low energy</option>
                <option value="normal">Normal energy</option>
                <option value="high">High energy</option>
              </select>
            </div>
          ))}
        </div>

        <button onClick={submit} disabled={submitting} className="btn-primary mt-4">
          {submitting ? "Submitting..." : "Submit schedule & generate plan"}
        </button>

        {status && <p className="mt-3 text-sm text-fitos-muted">{status}</p>}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <AuthGate>
      <ScheduleForm />
    </AuthGate>
  );
}
