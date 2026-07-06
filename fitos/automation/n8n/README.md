# FitOS n8n Automation Workflows

Five importable workflows that turn the FitOS backend into a fully automated
system. Import order matters because three workflows call the Telegram
sender as a sub-workflow.

## 1. Prerequisites

- A running n8n instance (self-hosted or n8n Cloud).
- The FitOS backend deployed and reachable from n8n (e.g. `https://api.yourdomain.com/api`).
- A Telegram bot token from [@BotFather](https://t.me/BotFather) (the same
  token used by `telegram-bot/`, or a dedicated one - either works since both
  just call `sendMessage`).
- Your FitOS `user_id` (visible on the dashboard's Settings page, or via
  `GET /api/me` once logged in) and your Telegram `chat_id` (send `/start` to
  your bot, then `/link <user_id>` - the bot will confirm; or read it from
  Telegram's "getUpdates" API).

## 2. Set n8n environment variables

In n8n's instance settings (Settings -> Environment, or your `.env` if
self-hosting), set:

| Variable | Example | Purpose |
|---|---|---|
| `FITOS_API_BASE_URL` | `https://api.yourdomain.com/api` | Backend base URL |
| `FITOS_WEBHOOK_SECRET` | matches backend's `FITOS_WEBHOOK_SECRET` | Authenticates n8n -> backend calls |
| `FITOS_USER_ID` | `b3f1...` | Your FitOS profile ID (single-user personal system) |
| `FITOS_TELEGRAM_CHAT_ID` | `123456789` | Your linked Telegram chat ID |
| `FITOS_TELEGRAM_SENDER_WORKFLOW_ID` | set after step 3 | ID of the imported Telegram sender workflow |

## 3. Import the Telegram sender workflow first

1. n8n -> Workflows -> Import from File -> `telegram-message-sender.json`.
2. Open the imported workflow, click the **Send Telegram Message** node, and
   attach your Telegram Bot credential (create one if you haven't: paste the
   bot token from BotFather).
3. Save and note the workflow's ID from the URL bar
   (`.../workflow/<this-id>`). Set `FITOS_TELEGRAM_SENDER_WORKFLOW_ID` to it.
4. Activate the workflow (toggle top-right) so it's callable by the others.

## 4. Import the remaining four workflows

Import each via Workflows -> Import from File:

- `weekly-schedule-trigger.json` - exposes a webhook
  (`POST /webhook/fitos-schedule-upload`) that the dashboard's weekly
  schedule form calls directly, OR your own automation can call, with body
  `{ user_id, week_start_date, days: [...7] }`. It uploads the schedule,
  immediately runs the AI Planner Core (`/generate-week-plan`, which also
  generates the grocery list), and sends a Telegram confirmation.
- `meal-plan-generator-trigger.json` - runs every Sunday at 20:00 and
  proactively generates the *upcoming* week's plan from whatever schedule is
  already on file, notifying success or a "please submit your schedule"
  nudge on failure.
- `grocery-list-trigger.json` - runs every Saturday at 08:00, rebuilds that
  week's grocery list (picking up any pantry changes since plan generation),
  and sends a formatted, category-grouped shopping list to Telegram.
- `daily-reminder-trigger.json` - polls `/reminders/pending` every 15 minutes,
  filters to reminders whose `reminder_time` has arrived, and fires each one
  through the Telegram sender sub-workflow, then marks it `sent`.

For each, activate the workflow once you've confirmed the environment
variables above are set correctly (Execute Workflow -> "once" from the UI to
test before activating on a schedule).

## 5. End-to-end flow this produces

```
User submits weekly schedule (dashboard form)
        |
        v
weekly-schedule-trigger  --->  POST /upload-schedule
        |                      POST /generate-week-plan (meals+workouts+reminders+grocery, all persisted)
        v
Telegram: "Your week is planned!"

Every 15 min --------------->  daily-reminder-trigger  --->  GET /reminders/pending
                                                              -> due reminders -> Telegram -> POST /reminders/:id/sent

Every Sunday 20:00 --------->  meal-plan-generator-trigger -> POST /generate-week-plan (for the upcoming week)

Every Saturday 08:00 -------->  grocery-list-trigger -> POST /generate-grocery-list -> Telegram shopping list
```

## 6. Testing a workflow manually

Each HTTP Request node can be run individually from the n8n editor ("Execute
step") with pinned test data, which is the fastest way to confirm
`FITOS_API_BASE_URL` and `FITOS_WEBHOOK_SECRET` are wired correctly before
turning on the schedule triggers.
