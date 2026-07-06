"use client";

import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import { api, GroceryItem } from "@/lib/api";

function currentWeekMonday(): string {
  const now = new Date();
  const jsDay = now.getUTCDay();
  const daysSinceMonday = jsDay === 0 ? 6 : jsDay - 1;
  now.setUTCDate(now.getUTCDate() - daysSinceMonday);
  return now.toISOString().slice(0, 10);
}

function GroceryContent() {
  const [weekStartDate, setWeekStartDate] = useState(currentWeekMonday());
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, GroceryItem[]> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.generateGroceryList(weekStartDate);
      setItemsByCategory(result.items_by_category);
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
          <button onClick={refresh} disabled={loading} className="btn-primary">
            {loading ? "Building..." : "Build / refresh grocery list"}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-400">
            {error} - generate this week's meal plan on the Week page first.
          </p>
        )}
      </div>

      {itemsByCategory &&
        Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="card">
            <h3 className="mb-2 font-semibold capitalize">{category}</h3>
            <ul className="flex flex-col gap-1 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.name} - {item.quantity}
                  </span>
                  {item.already_in_pantry && <span className="text-fitos-accent">already have</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}

export default function GroceryPage() {
  return (
    <AuthGate>
      <GroceryContent />
    </AuthGate>
  );
}
