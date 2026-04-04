import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFound.js";
import { contributionsRouter } from "./routes/contributions.js";
import { entitiesRouter } from "./routes/entities.js";
import { healthRouter } from "./routes/health.js";
import { reportsRouter } from "./routes/reports.js";
import { signalsRouter } from "./routes/signals.js";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api", healthRouter);
app.use("/api", entitiesRouter);
app.use("/api", contributionsRouter);
app.use("/api", reportsRouter);
app.use("/api", signalsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
