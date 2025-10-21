/*
  Warnings:

  - You are about to drop the `EmailChangeRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ChangeRequestStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ChangeRequestType" AS ENUM ('EMAIL', 'PASSWORD');

-- CreateEnum
CREATE TYPE "public"."TypeConfirmation" AS ENUM ('EMAIL', 'TWO_FACTOR', 'SECURITY_KEY');

-- DropForeignKey
ALTER TABLE "public"."EmailChangeRequest" DROP CONSTRAINT "EmailChangeRequest_userId_fkey";

-- DropTable
DROP TABLE "public"."EmailChangeRequest";

-- DropEnum
DROP TYPE "public"."EmailChangeRequestStatus";

-- CreateTable
CREATE TABLE "public"."ChangeRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "type" "public"."ChangeRequestType" NOT NULL,
    "status" "public"."ChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "typeConfirmation" "public"."TypeConfirmation" NOT NULL DEFAULT 'EMAIL',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "newValue" TEXT,
    "oldValue" TEXT,

    CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChangeRequest_token_key" ON "public"."ChangeRequest"("token");

-- CreateIndex
CREATE INDEX "ChangeRequest_userId_idx" ON "public"."ChangeRequest"("userId");

-- CreateIndex
CREATE INDEX "ChangeRequest_token_idx" ON "public"."ChangeRequest"("token");

-- CreateIndex
CREATE INDEX "ChangeRequest_status_expiresAt_idx" ON "public"."ChangeRequest"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "ChangeRequest_type_idx" ON "public"."ChangeRequest"("type");

-- CreateIndex
CREATE INDEX "ChangeRequest_type_status_idx" ON "public"."ChangeRequest"("type", "status");

-- CreateIndex
CREATE INDEX "ChangeRequest_newValue_idx" ON "public"."ChangeRequest"("newValue");

-- CreateIndex
CREATE INDEX "ChangeRequest_oldValue_idx" ON "public"."ChangeRequest"("oldValue");

-- AddForeignKey
ALTER TABLE "public"."ChangeRequest" ADD CONSTRAINT "ChangeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
