import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const workspaceRoot = path.resolve(currentDir, "../..");

for (const envPath of [
  path.join(currentDir, ".env"),
  path.join(workspaceRoot, ".env")
]) {
  loadEnv({ path: envPath, override: false });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Create a root .env or apps/api/.env before running Prisma commands."
  );
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations"
  },
  datasource: {
    url: databaseUrl
  }
});
