import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFound.js";
import { entitiesRouter } from "./routes/entities.js";
import { healthRouter } from "./routes/health.js";
import { reportsRouter } from "./routes/reports.js";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api", healthRouter);
app.use("/api", entitiesRouter);
app.use("/api", reportsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
