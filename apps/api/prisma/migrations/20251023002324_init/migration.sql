/*
  Warnings:

  - The values [NONE] on the enum `ProfileType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProfileType_new" AS ENUM ('JOGADOR', 'TORCEDOR', 'ATLETICA');
ALTER TABLE "User" ALTER COLUMN "profileType" TYPE "ProfileType_new" USING ("profileType"::text::"ProfileType_new");
ALTER TYPE "ProfileType" RENAME TO "ProfileType_old";
ALTER TYPE "ProfileType_new" RENAME TO "ProfileType";
DROP TYPE "public"."ProfileType_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profileType" DROP NOT NULL;
