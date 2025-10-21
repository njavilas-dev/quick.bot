/*
  Warnings:

  - A unique constraint covering the columns `[botId,token]` on the table `UserVerificationToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `botId` to the `UserVerificationToken` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `UserVerificationToken` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- Cleanup existing UserVerificationToken records before adding botId constraint
-- These are temporary tokens and can be safely deleted
DELETE FROM "UserVerificationToken" WHERE 1=1;

-- DropIndex
DROP INDEX "UserVerificationToken_identifier_token_key";

-- AlterTable
ALTER TABLE "UserVerificationToken" ADD COLUMN     "botId" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "UserVerificationToken_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserVerificationToken_botId_token_key" ON "UserVerificationToken"("botId", "token");

-- AddForeignKey
ALTER TABLE "UserVerificationToken" ADD CONSTRAINT "UserVerificationToken_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;