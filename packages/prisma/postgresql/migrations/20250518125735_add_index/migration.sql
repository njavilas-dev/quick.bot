/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `WorkspaceBillingPlanTier` table. All the data in the column will be lost.
  - Changed the type of `ip` on the `UserBannedIp` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "UserBannedIp" DROP COLUMN "ip",
ADD COLUMN     "ip" INET NOT NULL;

-- AlterTable
ALTER TABLE "WorkspaceBillingPlanTier" DROP COLUMN "deletedAt";

-- CreateIndex
CREATE INDEX "AnswerV2_resultId_idx" ON "AnswerV2"("resultId");

-- CreateIndex
CREATE INDEX "Bot_variables_idx" ON "Bot" USING GIN ("variables" jsonb_path_ops);

-- CreateIndex
CREATE INDEX "BotCollaborator_botId_idx" ON "BotCollaborator"("botId");

-- CreateIndex
CREATE INDEX "BotInvitation_botId_idx" ON "BotInvitation"("botId");

-- CreateIndex
CREATE INDEX "UserAuth_userId_idx" ON "UserAuth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBannedIp_ip_key" ON "UserBannedIp"("ip");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceInvitation_workspaceId_idx" ON "WorkspaceInvitation"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");
