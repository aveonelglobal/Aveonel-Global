# FitOS Architecture

## Design principle

FitOS's planning logic is **deterministic and rule-based by default**. It
works completely with zero LLM API key configured. An optional AI layer
(Claude, via `ANTHROPIC_API_KEY`) adds narrative summaries and can be
extended for plan review, but numbers (calories, protein, ingredients) are
always produced by the rule engine, never invented by a model. This keeps
the system reliable, inspectable, and cheap to run continuously.

## Module map

```
Schedule upload (dashboard/n8n webhook)
        |
        v
[Scheduler Module]  scheduler.service.ts
  - validates the 7-day input, supersedes any existing schedule for that week
  - normalizeScheduleDay() turns work_start/work_end/commute into
    work / commute / free / sleep time blocks + derived flags:
    is_late_finish, is_long_commute, free_minutes, longest_free_block_min
        |
        v
[AI Planner Core]  plannerCore.service.ts  (generateFullWeeklyPlan)
  loads: profile, normalized schedule, cycle phase per day, pantry items
        |
        +--> [Meal Planning Engine]  mealPlanner.service.ts
        |      for each day x each of 5 slots (breakfast/snack_am/lunch/
        |      snack_pm/dinner):
        |        - compute slot calorie/protein budget (adjusted for cycle
        |          phase via adjustTargetForCyclePhase - luteal/menstrual
        |          get the higher end of the range, follicular/ovulation
        |          lean toward the deficit floor)
        |        - query candidate recipes filtered by the day's constraints
        |          (see "Logic rules" below)
        |        - score candidates: closeness to calorie/protein target,
        |          variety penalty for repeats, pantry-match bonus,
        |          expiring-ingredient bonus
        |        - pick the top-scoring recipe
        |
        +--> [Workout Engine]  workout.service.ts
        |      picks walk / home_workout / rest / stretch from free_minutes,
        |      energy_level, is_late_finish, is_day_off, is_travel_day
        |
        +--> [Reminder System]  reminders.service.ts
        |      water (spread across waking hours), one reminder per planned
        |      meal, one workout reminder, one night-prep reminder that
        |      looks at TOMORROW's meals (pack lunch / soak dal / prep a
        |      portable breakfast), one wind-down-for-sleep reminder
        |
        +--> [Grocery Generator]  grocery.service.ts
               walks every meal's recipe_id, aggregates ingredients,
               dedupes, groups by category, flags items already in pantry
        |
        v
   Persisted: meal_plans, meals, workouts, reminders, grocery_lists/items
        |
        v
   Consumed by: /get-dashboard (frontend + Telegram /today),
                /reminders/pending (n8n daily-reminder-trigger + bot),
                Telegram /week, n8n weekly-schedule-trigger confirmation
```

## Adaptive nutrition for an irregular cycle

`utils/nutrition.ts::adjustTargetForCyclePhase` reads the day's `cycle_logs.phase`
(entered manually or inferred by whatever tracking the user prefers) and
shifts that day's calorie/protein target within the user's configured range
rather than holding a flat deficit every day:

- **menstrual**: top of calorie/protein range (higher energy/iron needs)
- **luteal**: ~95% of max calories, top of protein range (cravings + higher BMR)
- **follicular / ovulation**: bottom of calorie range (best insulin sensitivity)
- **unknown / tracking disabled**: midpoint of the range

## Logic rules implemented in the Meal Planning Engine

| Rule | Where |
|---|---|
| Work ends >= 20:00 -> dinner must be < 15 min prep | `candidatesForSlot()`, `is_late_finish` |
| Commute > 60 min -> breakfast must be portable | `candidatesForSlot()`, `is_long_commute` |
| Busy day (< 180 free min) -> simplify (<=20 min prep) | `candidatesForSlot()`, `isBusyDay` |
| Working day -> lunch favors lunchbox-safe recipes | `candidatesForSlot()` |
| Free day -> longer walk + fuller home workout | `workout.service.ts` |
| Pantry item on hand -> scored higher | `scoreRecipe()` pantry bonus |
| Ingredient expiring within 3 days -> scored higher | `scoreRecipe()` expiring bonus |
| Fallback: if a strict filter returns zero recipes | `candidatesForSlot()` progressively relaxes constraints rather than leaving a slot unplanned |

## Data flow for automation (n8n)

n8n never talks to Supabase directly - it only calls the backend's HTTP API
with a shared secret (`x-fitos-webhook-secret`) plus the FitOS `user_id`,
exactly the same authentication path used internally. See
`automation/n8n/README.md` for the five workflows and how they chain
together with the Telegram bot.
