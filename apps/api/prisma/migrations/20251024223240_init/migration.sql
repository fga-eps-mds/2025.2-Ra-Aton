/*
  Warnings:

  - Made the column `passwordHash` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL,
ALTER COLUMN "profileType" DROP NOT NULL,
ALTER COLUMN "profileType" DROP DEFAULT;
