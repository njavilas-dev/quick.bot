/*
  Warnings:

  - You are about to drop the column `graphNavigation` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "graphNavigation";

-- DropEnum
DROP TYPE "public"."GraphNavigation";
