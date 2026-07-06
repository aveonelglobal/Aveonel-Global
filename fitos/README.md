# FitOS

A personal AI health operating system built for a pure vegetarian Gujarati
Indian diet, fat-loss focused, with an irregular schedule and an irregular
menstrual cycle. The only manual input is a **weekly schedule**; everything
else - meal plans, grocery lists, workouts, and reminders - is generated and
delivered automatically.

## What's in this folder

```
fitos/
├── database/           SQL schema + seed data (Supabase/Postgres)
│   ├── schema.sql
│   └── seed_recipes.sql        78 Gujarati vegetarian recipes
├── backend/             Node.js + TypeScript + Express API
│   └── src/
│       ├── modules/     scheduler, recipes, mealPlanning, grocery,
│       │                reminders, workouts, progress, planner, users
│       ├── ai/          prompt layer + optional Claude integration
│       └── routes/      the 6 required endpoints + supporting ones
├── frontend/             Next.js dashboard (schedule input, plan/grocery/progress views)
├── telegram-bot/        Standalone Telegram bot (/today /week /log)
├── automation/n8n/      5 importable n8n workflows + setup README
└── docs/                Architecture, API reference, deployment guide
```

## Quick start (local)

1. **Database**: create a Supabase project, then run `database/schema.sql`
   followed by `database/seed_recipes.sql` in the Supabase SQL editor (or
   `psql`). See `docs/DEPLOYMENT.md`.
2. **Backend**:
   ```bash
   cd backend && cp .env.example .env   # fill in Supabase URL/keys
   npm install && npm run dev            # http://localhost:4000
   ```
3. **Frontend**:
   ```bash
   cd frontend && cp .env.example .env.local   # fill in Supabase + API URL
   npm install && npm run dev            # http://localhost:3000
   ```
4. **Telegram bot** (optional but recommended):
   ```bash
   cd telegram-bot && cp .env.example .env   # bot token + backend URL/secret
   npm install && npm run dev
   ```
5. **n8n automation** (optional, for full "set it and forget it" automation):
   see `automation/n8n/README.md`.

## The one manual step

Every week (or whenever your schedule changes), open the dashboard's
**Schedule** page and fill in working hours / days off / travel days for the
week. Submitting it immediately:

1. Persists the schedule and normalizes it into work/commute/free/sleep time
   blocks (`Scheduler Module`).
2. Runs the **AI Planner Core**, which selects 5 meals/day from the recipe
   library respecting prep-time, portability and calorie/protein targets
   (`Meal Planning Engine`), builds that day's workout from available free
   time (`Workout Engine`), and schedules water/meal/workout/night-prep/sleep
   reminders (`Reminder System`).
3. Aggregates every planned meal's ingredients into a deduplicated,
   category-grouped shopping list, checked against your pantry
   (`Grocery Generator`).

From there from your phone via the dashboard or the Telegram bot's `/today`
and `/week` commands, and log weight/food/water with `/log` - no further
planning required.

See `docs/ARCHITECTURE.md` for how the modules fit together and
`docs/API.md` for the full endpoint reference.
