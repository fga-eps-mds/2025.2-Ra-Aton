import { PrismaClient } from "@prisma/client";
import { config } from "../config/env";

declare global {
  // allow global prisma during development to avoid hot-reload issues

  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prisma ??
  new PrismaClient({ log: ["query", "info", "warn", "error"] });

if (config.NODE_ENV !== "production") global.prisma = prisma;
