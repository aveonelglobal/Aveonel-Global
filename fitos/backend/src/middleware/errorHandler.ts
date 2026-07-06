import { NextFunction, Request, Response } from "express";
import { ScheduleValidationError } from "../modules/scheduler/scheduler.service";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ScheduleValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("FitOS API error:", err);
  res.status(500).json({ error: message });
}
