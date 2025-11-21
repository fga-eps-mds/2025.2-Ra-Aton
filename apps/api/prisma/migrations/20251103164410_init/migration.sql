/*
  Warnings:

  - You are about to drop the column `content` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `eventDate` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `eventFinishDate` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMembership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MatchToTeam` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `MatchDate` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MatchStatus` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxPlayers` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeamSide" AS ENUM ('A', 'B');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('EM_BREVE', 'EM_ANDAMENTO', 'FINALIZADO');

-- DropForeignKey
ALTER TABLE "public"."Match" DROP CONSTRAINT "Match_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Team" DROP CONSTRAINT "Team_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamMembership" DROP CONSTRAINT "TeamMembership_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamMembership" DROP CONSTRAINT "TeamMembership_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MatchToTeam" DROP CONSTRAINT "_MatchToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MatchToTeam" DROP CONSTRAINT "_MatchToTeam_B_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "content",
DROP COLUMN "eventDate",
DROP COLUMN "eventFinishDate",
DROP COLUMN "groupId",
ADD COLUMN     "MatchDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "MatchStatus" "MatchStatus" NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "maxPlayers" INTEGER NOT NULL,
ADD COLUMN     "teamNameA" TEXT DEFAULT 'TIME_A',
ADD COLUMN     "teamNameB" TEXT DEFAULT 'TIME_B';

-- DropTable
DROP TABLE "public"."Team";

-- DropTable
DROP TABLE "public"."TeamMembership";

-- DropTable
DROP TABLE "public"."_MatchToTeam";

-- CreateTable
CREATE TABLE "PlayerSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "team" "TeamSide" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSubscription_userId_matchId_key" ON "PlayerSubscription"("userId", "matchId");

-- AddForeignKey
ALTER TABLE "PlayerSubscription" ADD CONSTRAINT "PlayerSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSubscription" ADD CONSTRAINT "PlayerSubscription_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
