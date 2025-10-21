/*
  Warnings:

  - Made the column `newValue` on table `ChangeRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `oldValue` on table `ChangeRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."ChangeRequest" ALTER COLUMN "newValue" SET NOT NULL,
ALTER COLUMN "oldValue" SET NOT NULL;
