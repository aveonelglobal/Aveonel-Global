# FitOS Deployment Guide

## 1. Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `database/schema.sql`, then
   `database/seed_recipes.sql` (in that order - the seed file references the
   `recipes` table the schema creates).
3. Under Settings -> API, copy the **Project URL**, **anon public key**, and
   **service_role key** - you'll need all three.
4. Under Authentication -> Providers, enable **Email** (magic link, on by
   default) and optionally **Google** if you want Google sign-in.

## 2. Backend (Node.js/Express)

Deployable to any Node host (Render, Railway, Fly.io, a small VPS). Example
for a generic host:

```bash
cd backend
npm install
npm run build
```

Set these environment variables in your host (see `.env.example`):
`PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`,
`FITOS_WEBHOOK_SECRET` (generate a random string - n8n and the Telegram bot
must use the same value), and optionally `ANTHROPIC_API_KEY`.

Start with `npm start`. Health check: `GET /api/health`.

## 3. Frontend (Next.js)

Deploy to Vercel (recommended) or any Node host:

```bash
cd frontend
npm install
npm run build
```

Environment variables (see `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_FITOS_API_BASE_URL` (your
deployed backend's `/api` URL).

## 4. Telegram bot

1. Create a bot with [@BotFather](https://t.me/BotFather), get the token.
2. Deploy `telegram-bot/` as a long-running worker (it uses long polling, so
   any always-on Node process works - Render/Railway background worker, a
   small VPS with `pm2`, etc). It does not need an inbound port.
3. Environment variables (see `.env.example`): `TELEGRAM_BOT_TOKEN`,
   `FITOS_API_BASE_URL`, `FITOS_WEBHOOK_SECRET` (must match the backend's).
4. In Telegram, send `/start` then `/link <your-fitos-user-id>` (find your
   user ID via `GET /api/me` while signed in, or on the dashboard).

## 5. n8n automation

See `automation/n8n/README.md` for importing the five workflows and wiring
their environment variables. This step is optional but is what makes the
system fully "set it and forget it" - proactive weekly planning, Saturday
grocery lists, and reminder delivery every 15 minutes without opening the
dashboard.

## 6. Order of operations for a first-time setup

1. Supabase schema + seed data.
2. Backend deployed and reachable.
3. Frontend deployed, pointed at the backend.
4. Sign in on the dashboard (auto-creates your FitOS profile with the
   default Gujarati-vegetarian fat-loss targets).
5. Submit your first weekly schedule on the Schedule page - this also
   triggers the first plan generation.
6. Link the Telegram bot (`/link <user_id>`).
7. Import and configure the n8n workflows for full automation.
