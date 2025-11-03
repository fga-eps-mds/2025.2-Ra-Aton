/*
  Warnings:

  - Added the required column `team` to the `PlayerSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeamSide" AS ENUM ('A', 'B');

-- AlterTable
ALTER TABLE "PlayerSubscription" ADD COLUMN     "team" "TeamSide" NOT NULL;
