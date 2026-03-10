import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../config/env.js";

declare global {
  // eslint-disable-next-line no-var
  var __todoPrisma__: PrismaClient | undefined;
}

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
});

export const prisma =
  globalThis.__todoPrisma__ ??
  new PrismaClient({
    adapter
  });

if (env.NODE_ENV !== "production") {
  globalThis.__todoPrisma__ = prisma;
}
