/*
  Warnings:

  - You are about to drop the column `bannerImageId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bannerImageUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "bannerImageId",
DROP COLUMN "bannerImageUrl",
DROP COLUMN "profileImageId",
DROP COLUMN "profileImageUrl";
