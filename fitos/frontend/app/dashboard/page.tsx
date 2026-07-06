"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { api, DashboardResponse } from "@/lib/api";

const SLOT_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  snack_am: "Morning snack",
  lunch: "Lunch",
  snack_pm: "Evening snack",
  dinner: "Dinner",
};

function DashboardContent() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [waterInput, setWaterInput] = useState("");

  async function load() {
    try {
      setData(await api.getDashboard());
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function logWeight() {
    if (!weightInput) return;
    await api.logProgress({ log_date: new Date().toISOString().slice(0, 10), weight_kg: parseFloat(weightInput) });
    setWeightInput("");
    load();
  }

  async function logWater() {
    if (!waterInput) return;
    await api.logProgress({ log_date: new Date().toISOString().slice(0, 10), water_intake_ml: parseInt(waterInput, 10) });
    setWaterInput("");
    load();
  }

  async function markWorkoutDone() {
    await api.logProgress({ log_date: new Date().toISOString().slice(0, 10), workout_completed: true });
    load();
  }

  if (error) {
    return (
      <div className="card text-sm text-red-400">
        {error}
        <div className="mt-2 text-fitos-muted">
          If this is your first time here, make sure you've uploaded a schedule and generated a plan on the Week page.
        </div>
      </div>
    );
  }
  if (!data) return <div className="text-fitos-muted">Loading dashboard...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Today - {data.date}</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {data.today.meals.map((m) => (
            <li key={m.id} className="flex justify-between border-b border-[#24312a] pb-2 last:border-0">
              <span>
                <span className="text-fitos-muted">{m.scheduled_time ?? "--:--"}</span> {SLOT_LABEL[m.meal_slot] ?? m.meal_slot}:{" "}
                {m.recipes?.name ?? "-"}
              </span>
              <span className="text-fitos-muted">
                {m.calories}kcal / {m.protein_g}g
              </span>
            </li>
          ))}
          {data.today.meals.length === 0 && <li className="text-fitos-muted">No meals planned. Generate this week's plan first.</li>}
        </ul>
      </div>

      <div className="card">
        <h2 className="mb-2 text-lg font-semibold">Workout</h2>
        {data.today.workout ? (
          <div className="text-sm">
            <p className="font-medium">{data.today.workout.title}</p>
            <p className="text-fitos-muted">{data.today.workout.description}</p>
            <p className="mt-1 text-fitos-muted">
              {data.today.workout.duration_min} min - {data.today.workout.intensity} intensity
            </p>
            <button onClick={markWorkoutDone} className="btn-primary mt-3">
              Mark completed
            </button>
          </div>
        ) : (
          <p className="text-sm text-fitos-muted">No workout planned yet.</p>
        )}
      </div>

      <div className="card">
        <h2 className="mb-2 text-lg font-semibold">Reminders</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {data.today.reminders.map((r) => (
            <li key={r.id} className="flex justify-between">
              <span>{r.title}</span>
              <span className="text-fitos-muted">{r.reminder_time}</span>
            </li>
          ))}
          {data.today.reminders.length === 0 && <li className="text-fitos-muted">No reminders scheduled.</li>}
        </ul>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Quick log</h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="Weight (kg)"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="input w-32"
            />
            <button onClick={logWeight} className="btn-primary">
              Log
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Water (ml)"
              value={waterInput}
              onChange={(e) => setWaterInput(e.target.value)}
              className="input w-32"
            />
            <button onClick={logWater} className="btn-primary">
              Log
            </button>
          </div>
        </div>
        {data.today.progress && (
          <p className="mt-3 text-sm text-fitos-muted">
            Today so far: {data.today.progress.weight_kg ?? "-"}kg | {data.today.progress.water_intake_ml ?? 0}ml water | adherence{" "}
            {data.today.progress.adherence_score ?? "-"}%
          </p>
        )}
      </div>

      {data.week.report && (
        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">This week</h2>
          <p className="text-sm text-fitos-muted">{data.week.report.summary}</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGate>
      <DashboardContent />
    </AuthGate>
  );
}
