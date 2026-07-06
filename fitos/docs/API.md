# FitOS Backend API Reference

Base URL: `{FITOS_API_BASE_URL}` (e.g. `http://localhost:4000/api` locally).

## Authentication

Every route except `GET /health`, `POST /telegram/link` and
`GET /telegram/resolve` requires one of:

- **Browser/app session**: `Authorization: Bearer <supabase-access-token>`.
  The backend verifies it against Supabase Auth and auto-creates the user's
  FitOS profile on first call.
- **Automation caller** (n8n, the Telegram bot): header
  `x-fitos-webhook-secret: <FITOS_WEBHOOK_SECRET>` plus `user_id` in the
  request body (POST) or query string (GET).

## Endpoints

### `GET /health`
No auth. Liveness check. `{ status: "ok", service: "fitos-backend" }`

### `GET /me` / `PATCH /me`
Fetch or update the current user's profile (weight, targets, commute
minutes, telegram_chat_id, etc).

### `POST /upload-schedule`
**The only manual input step.** Body:
```json
{
  "week_start_date": "2025-06-02",
  "days": [
    { "day_of_week": 0, "work_start": "09:30", "work_end": "18:30", "is_day_off": false, "is_travel_day": false, "energy_level": "normal" },
    ...7 entries total, day_of_week 0=Monday..6=Sunday
  ]
}
```
`week_start_date` must be a Monday. Supersedes any existing schedule for
that week. Returns the normalized time blocks per day.

### `POST /generate-week-plan`
Body: `{ "week_start_date": "2025-06-02" }`. Requires a schedule already
uploaded for that week. Runs the full AI Planner Core and persists meals,
workouts, reminders, and the grocery list. Returns
`{ mealPlanId, plan, groceryListId, summary }`.

### `POST /generate-daily-plan`
Body: `{ "week_start_date": "2025-06-02", "day_of_week": 2 }`. Regenerates
the week (for planning consistency) and returns just that day's plan.

### `GET /get-dashboard?date=YYYY-MM-DD`
Defaults to today. Returns today's meals/workout/reminders/progress plus the
current week's progress logs and rollup report and grocery list status -
the single call the frontend and Telegram `/today` use.

### `POST /log-progress`
Body (all optional except `log_date`):
```json
{ "log_date": "2025-06-02", "weight_kg": 61.8, "water_intake_ml": 500,
  "calories_consumed": 350, "protein_consumed_g": 18, "workout_completed": true,
  "mood": "good", "notes": "..." }
```
Upserts the day's log and recomputes its adherence score.

### `POST /generate-grocery-list`
Body: `{ "week_start_date": "2025-06-02" }`. Rebuilds the grocery list from
that week's already-planned meals + current pantry (use after editing the
pantry without re-planning meals).

### `GET /grocery-list?week_start_date=YYYY-MM-DD`
Returns the stored grocery list with items.

### `GET /recipes?category=breakfast`
Browse the recipe library; `category` is optional
(breakfast/lunch/dinner/snack/beverage).

### `GET /pantry` / `POST /pantry` / `DELETE /pantry/:id`
List, add, or remove pantry stock items (`{ name, category, quantity?, expires_on? }`).

### `GET /reminders/pending?date=YYYY-MM-DD`
Reminders for that date not yet sent - polled by n8n's
`daily-reminder-trigger` and the Telegram bot.

### `POST /reminders/:id/sent`
Marks a reminder delivered.

### `POST /reminders/:id/ack`
Marks a reminder acknowledged by the user.

### `POST /telegram/link`
No user session required - gated only by the webhook secret. Body:
`{ "user_id": "...", "chat_id": "..." }`. Links a Telegram chat to a FitOS
profile (called once via the bot's `/link <user_id>` command).

### `GET /telegram/resolve?chat_id=...`
No user session required - gated only by the webhook secret. Returns
`{ user_id }` for a linked chat, or 404 if unlinked.
