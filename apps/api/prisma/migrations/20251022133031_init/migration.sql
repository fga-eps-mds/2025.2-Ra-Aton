-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "profileType" TEXT NOT NULL DEFAULT 'jogador';
