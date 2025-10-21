import { BillingPlanType } from '@quickbot.io/prisma'
import { z } from '../zod'

const userEvent = z.object({
  userId: z.string(),
})

const workspaceEvent = userEvent.merge(
  z.object({
    workspaceId: z.string(),
  }),
)

const botEvent = workspaceEvent.merge(
  z.object({
    botId: z.string(),
  }),
)

const workspaceCreatedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace created'),
    data: z.object({
      name: z.string().optional(),
      billingPlan: z.nativeEnum(BillingPlanType),
    }),
  }),
)

const workspaceDeletedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace deleted'),
    data: z.object({
      name: z.string().optional(),
      billingPlan: z.nativeEnum(BillingPlanType),
    }),
  }),
)

const userCreatedEventSchema = userEvent.merge(
  z.object({
    name: z.literal('User created'),
    data: z.object({
      email: z.string(),
      name: z.string().optional(),
    }),
  }),
)

const userLoggedInEventSchema = userEvent.merge(
  z.object({
    name: z.literal('User logged in'),
  }),
)

const userUpdatedEventSchema = userEvent.merge(
  z.object({
    name: z.literal('User updated'),
    data: z.object({
      name: z.string().optional(),
      onboardingCategories: z.array(z.string()).optional(),
      referral: z.string().optional(),
      company: z.string().optional(),
    }),
  }),
)

const botCreatedEventSchema = botEvent.merge(
  z.object({
    name: z.literal('Bot created'),
    data: z.object({
      name: z.string(),
      template: z.string().optional(),
    }),
  }),
)

const publishedBotEventSchema = botEvent.merge(
  z.object({
    name: z.literal('Bot published'),
    data: z.object({
      name: z.string(),
      isFirstPublish: z.literal(true).optional(),
    }),
  }),
)

const botDeletedEventSchema = botEvent.merge(
  z.object({
    name: z.literal('Bot deleted'),
    data: z.object({
      name: z.string(),
    }),
  }),
)

const customDomainAddedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Custom domain added'),
    data: z.object({
      domain: z.string(),
    }),
  }),
)

const whatsAppCredentialsCreatedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('WhatsApp credentials created'),
  }),
)

const subscriptionUpdatedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace subscription updated'),
    data: z.object({
      previousPlan: z.nativeEnum(BillingPlanType),
      plan: z.nativeEnum(BillingPlanType),
    }),
  }),
)

const subscriptionUpgradedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace subscription upgraded'),
    data: z.object({
      previousPlan: z.nativeEnum(BillingPlanType),
      plan: z.nativeEnum(BillingPlanType),
    }),
  }),
)

const subscriptionDowngradedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace subscription downgraded'),
    data: z.object({
      previousPlan: z.nativeEnum(BillingPlanType),
      plan: z.nativeEnum(BillingPlanType),
    }),
  }),
)

const subscriptionCanceledDueToNonPaymentEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace subscription canceled due to pending-payment'),
    data: z.object({
      previousPlan: z.nativeEnum(BillingPlanType),
      plan: z.nativeEnum(BillingPlanType),
    }),
  }),
)

const subscriptionAutoUpdatedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace subscription automatically updated'),
    data: z.object({
      previousPlan: z.nativeEnum(BillingPlanType),
      plan: z.nativeEnum(BillingPlanType),
    }),
  }),
)

const newResultsCollectedEventSchema = botEvent.merge(
  z.object({
    name: z.literal('New results collected'),
    data: z.object({
      total: z.number(),
      isFirstOfKind: z.literal(true).optional(),
    }),
  }),
)

const workspaceLimitReachedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace limit reached'),
    data: z.object({
      chatsLimit: z.number(),
      totalChatsUsed: z.number(),
    }),
  }),
)

const workspaceAutoQuarantinedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace automatically quarantined'),
    data: z.object({
      chatsLimit: z.number(),
      totalChatsUsed: z.number(),
    }),
  }),
)

export const subscriptionPastDueEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace subscription past due'),
  }),
)

export const subscriptionNotPastDueEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace subscription past due status removed'),
  }),
)

export const removedBrandingEventSchema = botEvent.merge(
  z.object({
    name: z.literal('Branding removed'),
  }),
)

export const createdFolderEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Folder created'),
  }),
)

export const publishedFileUploadBlockEventSchema = botEvent.merge(
  z.object({
    name: z.literal('File upload block published'),
  }),
)

export const visitedAnalyticsEventSchema = botEvent.merge(
  z.object({
    name: z.literal('Analytics visited'),
  }),
)

export const clientSideEvents = [removedBrandingEventSchema] as const

export const eventSchema = z.discriminatedUnion('name', [
  workspaceCreatedEventSchema,
  workspaceDeletedEventSchema,
  userCreatedEventSchema,
  userLoggedInEventSchema,
  botCreatedEventSchema,
  publishedBotEventSchema,
  botDeletedEventSchema,
  newResultsCollectedEventSchema,
  workspaceLimitReachedEventSchema,
  workspaceAutoQuarantinedEventSchema,
  subscriptionPastDueEventSchema,
  subscriptionNotPastDueEventSchema,
  subscriptionUpdatedEventSchema,
  subscriptionAutoUpdatedEventSchema,
  subscriptionUpgradedEventSchema,
  subscriptionDowngradedEventSchema,
  subscriptionCanceledDueToNonPaymentEventSchema,
  userUpdatedEventSchema,
  customDomainAddedEventSchema,
  whatsAppCredentialsCreatedEventSchema,
  createdFolderEventSchema,
  publishedFileUploadBlockEventSchema,
  visitedAnalyticsEventSchema,
  ...clientSideEvents,
])

export const clientSideCreateEventSchema = removedBrandingEventSchema.omit({
  userId: true,
})

export type TelemetryEvent = z.infer<typeof eventSchema>
