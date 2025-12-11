-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'EVENT_REMINDER';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false;
