import { Router } from "express";
import { env } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "todo-backend-starter",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});
