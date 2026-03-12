import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const apiRoot = path.resolve(currentDir, "../..");
const workspaceRoot = path.resolve(apiRoot, "../..");

for (const envPath of [
  path.join(apiRoot, ".env"),
  path.join(workspaceRoot, ".env")
]) {
  loadEnv({ path: envPath, override: false });
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

export const env = envSchema.parse(process.env);
