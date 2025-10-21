-- CreateEnum
CREATE TYPE "public"."EmailChangeRequestStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."EmailChangeRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "currentEmail" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."EmailChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "EmailChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailChangeRequest_token_key" ON "public"."EmailChangeRequest"("token");

-- CreateIndex
CREATE INDEX "EmailChangeRequest_userId_idx" ON "public"."EmailChangeRequest"("userId");

-- CreateIndex
CREATE INDEX "EmailChangeRequest_token_idx" ON "public"."EmailChangeRequest"("token");

-- CreateIndex
CREATE INDEX "EmailChangeRequest_status_expiresAt_idx" ON "public"."EmailChangeRequest"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "EmailChangeRequest_newEmail_idx" ON "public"."EmailChangeRequest"("newEmail");

-- AddForeignKey
ALTER TABLE "public"."EmailChangeRequest" ADD CONSTRAINT "EmailChangeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
