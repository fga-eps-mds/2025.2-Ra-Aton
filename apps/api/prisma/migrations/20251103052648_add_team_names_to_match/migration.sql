-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "teamNameA" TEXT NOT NULL DEFAULT 'Time A',
ADD COLUMN     "teamNameB" TEXT NOT NULL DEFAULT 'Time B';
