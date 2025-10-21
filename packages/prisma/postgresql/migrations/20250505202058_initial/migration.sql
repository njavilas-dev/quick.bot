-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('ADMIN', 'MEMBER', 'GUEST');

-- CreateEnum
CREATE TYPE "GraphNavigation" AS ENUM ('MOUSE', 'TRACKPAD');

-- CreateEnum
CREATE TYPE "CollaborationType" AS ENUM ('READ', 'WRITE', 'FULL_ACCESS');

-- CreateEnum
CREATE TYPE "BillingPlanType" AS ENUM ('FREE', 'PERSONAL', 'BUSINESS', 'ENTERPRISE', 'LIFETIME', 'UNLIMITED', 'OFFERED', 'CUSTOM');

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "username" TEXT,
    "password" TEXT,
    "recovery_password_token" TEXT,
    "is_verified" BOOLEAN,
    "verify_token" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "oauth_token_secret" TEXT,
    "oauth_token" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" TEXT NOT NULL,
    "almostReachedChatsLimit" BOOLEAN NOT NULL DEFAULT true,
    "reachedChatsLimit" BOOLEAN NOT NULL DEFAULT true,
    "botAnswersResult" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "company" TEXT,
    "onboardingCategories" JSONB NOT NULL,
    "referral" TEXT,
    "graphNavigation" "GraphNavigation",
    "preferredAppAppearance" TEXT,
    "displayedInAppNotifications" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserApiToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "stripeId" TEXT,
    "billingEmail" TEXT,
    "billingCompany" TEXT,
    "billingVatType" TEXT,
    "billingVatValue" TEXT,
    "additionalChatsIndex" INTEGER NOT NULL DEFAULT 0,
    "additionalStorageIndex" INTEGER NOT NULL DEFAULT 0,
    "chatsLimitFirstEmailSentAt" TIMESTAMP(3),
    "storageLimitFirstEmailSentAt" TIMESTAMP(3),
    "chatsLimitSecondEmailSentAt" TIMESTAMP(3),
    "storageLimitSecondEmailSentAt" TIMESTAMP(3),
    "isQuarantined" BOOLEAN NOT NULL DEFAULT false,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "isPastDue" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN,
    "billingPlanId" TEXT NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL
);

-- CreateTable
CREATE TABLE "WorkspaceInvitation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "WorkspaceRole" NOT NULL,

    CONSTRAINT "WorkspaceInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceCustomDomain" (
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceCustomDomain_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "WorkspaceCredential" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "iv" TEXT NOT NULL,

    CONSTRAINT "WorkspaceCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "WorkspaceDashboardFolder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "parentFolderId" TEXT,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceDashboardFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL,
    "version" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "icon" TEXT,
    "name" TEXT NOT NULL,
    "folderId" TEXT,
    "groups" JSONB NOT NULL,
    "events" JSONB,
    "variables" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "theme" JSONB NOT NULL,
    "selectedThemeTemplateId" TEXT,
    "settings" JSONB NOT NULL,
    "publicId" TEXT,
    "customDomain" TEXT,
    "workspaceId" TEXT NOT NULL,
    "resultsTablePreferences" JSONB,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "whatsAppCredentialsId" TEXT,
    "riskLevel" INTEGER,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotInvitation" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "type" "CollaborationType" NOT NULL
);

-- CreateTable
CREATE TABLE "BotCollaborator" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "type" "CollaborationType" NOT NULL
);

-- CreateTable
CREATE TABLE "BotPublic" (
    "id" TEXT NOT NULL,
    "version" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "botId" TEXT NOT NULL,
    "groups" JSONB NOT NULL,
    "events" JSONB,
    "variables" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "theme" JSONB NOT NULL,
    "settings" JSONB NOT NULL,

    CONSTRAINT "BotPublic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotResult" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "botId" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "hasStarted" BOOLEAN,
    "isArchived" BOOLEAN DEFAULT false,
    "lastChatSessionId" TEXT,

    CONSTRAINT "BotResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotResultVariableHistory" (
    "resultId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "variableId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "value" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "BotResultVisitedEdge" (
    "resultId" TEXT NOT NULL,
    "edgeId" TEXT NOT NULL,
    "index" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "BotLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "BotLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "variableId" TEXT,
    "content" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AnswerV2" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachedFileUrls" JSONB,
    "resultId" TEXT NOT NULL,

    CONSTRAINT "AnswerV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "userPropertiesToUpdate" JSONB NOT NULL,
    "code" TEXT NOT NULL,
    "dateRedeemedAt" TIMESTAMP(3),

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT,
    "method" TEXT NOT NULL,
    "queryParams" JSONB NOT NULL,
    "headers" JSONB NOT NULL,
    "body" TEXT,
    "botId" TEXT NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" JSONB NOT NULL,
    "isReplying" BOOLEAN,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotThemeTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "theme" JSONB NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "BotThemeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBannedIp" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "responsibleBotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserBannedIp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceBillingPlan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "key" "BillingPlanType" NOT NULL DEFAULT 'FREE',
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "chatsLimit" INTEGER,
    "storageLimit" INTEGER,
    "botsLimit" INTEGER,
    "membersLimit" INTEGER,
    "isSystem" BOOLEAN NOT NULL,
    "isYearly" BOOLEAN DEFAULT false,
    "allowCustomDomain" BOOLEAN NOT NULL DEFAULT false,
    "allowWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "allowAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "allowedBotBlocks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowGuests" BOOLEAN NOT NULL DEFAULT false,
    "allowResults" BOOLEAN NOT NULL DEFAULT false,
    "allowRemoveBrand" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkspaceBillingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceBillingPlanTier" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "upTo" INTEGER,
    "flatAmount" INTEGER,
    "flatAmountDecimal" TEXT,
    "unitAmount" INTEGER,
    "unitAmountDecimal" TEXT,
    "isInfinite" BOOLEAN NOT NULL DEFAULT false,
    "billingPlanId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceBillingPlanTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_provider_providerAccountId_key" ON "UserAuth"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_sessionToken_key" ON "UserSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotification_userId_key" ON "UserNotification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserApiToken_token_key" ON "UserApiToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_stripeId_key" ON "Workspace"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_userId_workspaceId_key" ON "WorkspaceMember"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "UserVerificationToken_token_key" ON "UserVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserVerificationToken_identifier_token_key" ON "UserVerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Bot_publicId_key" ON "Bot"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Bot_customDomain_key" ON "Bot"("customDomain");

-- CreateIndex
CREATE INDEX "Bot_workspaceId_idx" ON "Bot"("workspaceId");

-- CreateIndex
CREATE INDEX "Bot_isArchived_createdAt_idx" ON "Bot"("isArchived", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "BotInvitation_email_botId_key" ON "BotInvitation"("email", "botId");

-- CreateIndex
CREATE UNIQUE INDEX "BotCollaborator_userId_botId_key" ON "BotCollaborator"("userId", "botId");

-- CreateIndex
CREATE UNIQUE INDEX "BotPublic_botId_key" ON "BotPublic"("botId");

-- CreateIndex
CREATE INDEX "BotResult_botId_hasStarted_createdAt_idx" ON "BotResult"("botId", "hasStarted", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BotResult_botId_isCompleted_idx" ON "BotResult"("botId", "isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "BotResultVariableHistory_resultId_index_key" ON "BotResultVariableHistory"("resultId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "BotResultVisitedEdge_resultId_index_key" ON "BotResultVisitedEdge"("resultId", "index");

-- CreateIndex
CREATE INDEX "BotLog_resultId_idx" ON "BotLog"("resultId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_resultId_blockId_groupId_key" ON "Answer"("resultId", "blockId", "groupId");

-- CreateIndex
CREATE INDEX "AnswerV2_blockId_idx" ON "AnswerV2"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserBannedIp_ip_key" ON "UserBannedIp"("ip");

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserApiToken" ADD CONSTRAINT "UserApiToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_billingPlanId_fkey" FOREIGN KEY ("billingPlanId") REFERENCES "WorkspaceBillingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvitation" ADD CONSTRAINT "WorkspaceInvitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceCustomDomain" ADD CONSTRAINT "WorkspaceCustomDomain_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceCredential" ADD CONSTRAINT "WorkspaceCredential_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceDashboardFolder" ADD CONSTRAINT "WorkspaceDashboardFolder_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "WorkspaceDashboardFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceDashboardFolder" ADD CONSTRAINT "WorkspaceDashboardFolder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bot" ADD CONSTRAINT "Bot_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "WorkspaceDashboardFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bot" ADD CONSTRAINT "Bot_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotInvitation" ADD CONSTRAINT "BotInvitation_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotCollaborator" ADD CONSTRAINT "BotCollaborator_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotCollaborator" ADD CONSTRAINT "BotCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotPublic" ADD CONSTRAINT "BotPublic_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotResult" ADD CONSTRAINT "BotResult_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotResultVariableHistory" ADD CONSTRAINT "BotResultVariableHistory_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "BotResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotResultVisitedEdge" ADD CONSTRAINT "BotResultVisitedEdge_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "BotResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotLog" ADD CONSTRAINT "BotLog_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "BotResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "BotResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerV2" ADD CONSTRAINT "AnswerV2_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "BotResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotThemeTemplate" ADD CONSTRAINT "BotThemeTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBannedIp" ADD CONSTRAINT "UserBannedIp_responsibleBotId_fkey" FOREIGN KEY ("responsibleBotId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBannedIp" ADD CONSTRAINT "UserBannedIp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceBillingPlanTier" ADD CONSTRAINT "WorkspaceBillingPlanTier_billingPlanId_fkey" FOREIGN KEY ("billingPlanId") REFERENCES "WorkspaceBillingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
