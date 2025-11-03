/*
  Warnings:

  - You are about to drop the column `date` on the `Match` table. All the data in the column will be lost.
  - Added the required column `MatchDate` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('EM_BREVE', 'EM_ANDAMENTO', 'FINALIZADO');

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "date",
ADD COLUMN     "MatchDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "MatchStatus" "MatchStatus" NOT NULL DEFAULT 'EM_BREVE',
ADD COLUMN     "authorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
