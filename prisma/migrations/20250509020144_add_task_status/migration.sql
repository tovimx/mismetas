-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('ACCEPTED', 'SUGGESTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'SUGGESTED';
