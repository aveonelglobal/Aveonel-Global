"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { api, DashboardResponse } from "@/lib/api";

function ProgressContent() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDashboard().then(setData).catch((err) => setError((err as Error).message));
  }, []);

  if (error) return <div className="card text-sm text-red-400">{error}</div>;
  if (!data) return <div className="text-fitos-muted">Loading...</div>;

  const logs = data.week.progress_logs;
  const maxWeight = Math.max(...logs.map((l) => l.weight_kg ?? 0), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <h2 className="mb-2 text-lg font-semibold">Weekly report</h2>
        <p className="text-sm text-fitos-muted">{data.week.report?.summary ?? "Not enough data yet this week."}</p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Weight trend</h2>
        <div className="flex items-end gap-2" style={{ height: 120 }}>
          {logs.map((log) => (
            <div key={log.log_date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-fitos-accent"
                style={{ height: `${((log.weight_kg ?? 0) / maxWeight) * 100}px` }}
                title={`${log.weight_kg ?? "-"}kg on ${log.log_date}`}
              />
              <span className="text-[10px] text-fitos-muted">{log.log_date.slice(5)}</span>
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-fitos-muted">No logs yet this week - use /log weight on Telegram or the Today page.</p>}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-2 text-lg font-semibold">Adherence by day</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {logs.map((log) => (
            <li key={log.log_date} className="flex justify-between">
              <span>{log.log_date}</span>
              <span className="text-fitos-muted">{log.adherence_score ?? "-"}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <AuthGate>
      <ProgressContent />
    </AuthGate>
  );
}
