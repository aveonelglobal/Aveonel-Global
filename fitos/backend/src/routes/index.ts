import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { scheduleRouter } from "./schedule.routes";
import { plannerRouter } from "./planner.routes";
import { dashboardRouter } from "./dashboard.routes";
import { progressRouter } from "./progress.routes";
import { groceryRouter } from "./grocery.routes";
import { recipesRouter } from "./recipes.routes";
import { pantryRouter } from "./pantry.routes";
import { remindersRouter } from "./reminders.routes";
import { usersRouter } from "./users.routes";
import { telegramRouter } from "./telegram.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ status: "ok", service: "fitos-backend" }));

// Gated only by the shared webhook secret - used to link/resolve a Telegram
// chat_id to a FitOS user_id before a "logged in" identity exists for it.
apiRouter.use(telegramRouter);

// Every route below requires either a Supabase session (Authorization: Bearer)
// or an n8n webhook secret (x-fitos-webhook-secret + user_id).
apiRouter.use(requireAuth);

apiRouter.use(usersRouter);
apiRouter.use(scheduleRouter);
apiRouter.use(plannerRouter);
apiRouter.use(dashboardRouter);
apiRouter.use(progressRouter);
apiRouter.use(groceryRouter);
apiRouter.use(recipesRouter);
apiRouter.use(pantryRouter);
apiRouter.use(remindersRouter);
