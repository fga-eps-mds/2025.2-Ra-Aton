/*
  Warnings:

  - You are about to drop the `avaliation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."avaliation" DROP CONSTRAINT "avaliation_userId_fkey";

-- DropTable
DROP TABLE "public"."avaliation";

-- CreateTable
CREATE TABLE "Avaliation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 5,
    "message" TEXT,

    CONSTRAINT "Avaliation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Avaliation" ADD CONSTRAINT "Avaliation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
