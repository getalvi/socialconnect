import { PrismaClient } from "@prisma/client";

// Reuse a single client across hot reloads in dev, and across the process in prod.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
