import { Prisma } from '@prisma/client'

// Export enums (valores reales que existen en runtime)
export {
    ChangeRequestStatus,
    ChangeRequestType,
    TypeConfirmation,
    WorkspaceRole,
    CollaborationType,
    BillingPlanType,
    PrismaClient,
} from '@prisma/client'

// Export tipos de modelos usando Prisma namespace
export type UserAuth = Prisma.UserAuthGetPayload<{}>
export type UserSession = Prisma.UserSessionGetPayload<{}>
export type UserVerificationToken = Prisma.UserVerificationTokenGetPayload<{}>
export type UserNotification = Prisma.UserNotificationGetPayload<{}>
export type User = Prisma.UserGetPayload<{}>
export type UserApiToken = Prisma.UserApiTokenGetPayload<{}>

export type ChangeRequest = Prisma.ChangeRequestGetPayload<{}>

export type Workspace = Prisma.WorkspaceGetPayload<{}>
export type WorkspaceMember = Prisma.WorkspaceMemberGetPayload<{}>
export type WorkspaceInvitation = Prisma.WorkspaceInvitationGetPayload<{}>
export type WorkspaceCustomDomain = Prisma.WorkspaceCustomDomainGetPayload<{}>
export type WorkspaceCredential = Prisma.WorkspaceCredentialGetPayload<{}>
export type WorkspaceDashboardFolder = Prisma.WorkspaceDashboardFolderGetPayload<{}>
export type WorkspaceBillingPlan = Prisma.WorkspaceBillingPlanGetPayload<{}>
export type WorkspaceBillingPlanTier = Prisma.WorkspaceBillingPlanTierGetPayload<{}>

export type Bot = Prisma.BotGetPayload<{}>
export type BotInvitation = Prisma.BotInvitationGetPayload<{}>
export type BotCollaborator = Prisma.BotCollaboratorGetPayload<{}>
export type BotPublic = Prisma.BotPublicGetPayload<{}>
export type BotResult = Prisma.BotResultGetPayload<{}>
export type BotResultVariableHistory = Prisma.BotResultVariableHistoryGetPayload<{}>
export type BotResultVisitedEdge = Prisma.BotResultVisitedEdgeGetPayload<{}>
export type BotLog = Prisma.BotLogGetPayload<{}>
export type AnswerV2 = Prisma.AnswerV2GetPayload<{}>
export type Coupon = Prisma.CouponGetPayload<{}>
export type Webhook = Prisma.WebhookGetPayload<{}>
export type ChatSession = Prisma.ChatSessionGetPayload<{}>
export type BotThemeTemplate = Prisma.BotThemeTemplateGetPayload<{}>
export type UserBannedIp = Prisma.UserBannedIpGetPayload<{}>