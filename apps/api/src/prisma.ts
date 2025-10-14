import { PrismaClient } from '@prisma/client';

declare global {
  // allow global prisma during development to avoid hot-reload issues
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prisma ?? new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
