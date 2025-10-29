import {
  WorkspaceBillingPlanTier as PrismaWorkspaceBillingPlanTier,
  WorkspaceBillingPlan as PrismaPlan,
  BillingPlanType,
} from '@quickbot.io/prisma'
import { z } from '../../zod'

export const chatStripeTierSchema = z.object({
  id: z.string(),
  upTo: z.number().nullable(),
  flatAmount: z.number().nullable(),
  flatAmountDecimal: z.string().nullable(),
  unitAmount: z.number().nullable(),
  unitAmountDecimal: z.string().nullable(),
  isInfinite: z.boolean(),
  billingPlanId: z.string(),
}) satisfies z.ZodType<
  Omit<PrismaWorkspaceBillingPlanTier, 'createdAt' | 'updatedAt' | 'deletedAt'>
>

export type ChatStripeTier = z.infer<typeof chatStripeTierSchema>

export const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.nativeEnum(BillingPlanType),
  description: z.string().nullable(),
  price: z.number(),
  chatsLimit: z.number().nullable(),
  storageLimit: z.number().nullable(),
  botsLimit: z.number().nullable(),
  membersLimit: z.number().nullable(),
  isSystem: z.boolean(),
  chatTiers: z.array(chatStripeTierSchema),
  currency: z.string(),
  isYearly: z.boolean().nullable(),
  allowCustomDomain: z.boolean(),
  allowWhatsapp: z.boolean(),
  allowAnalytics: z.boolean(),
  allowedBotBlocks: z.array(z.string()),
  allowGuests: z.boolean(),
  allowResults: z.boolean(),
  allowRemoveBrand: z.boolean(),
}) satisfies z.ZodType<
  Omit<PrismaPlan, 'createdAt' | 'updatedAt' | 'deletedAt'> & { chatTiers: ChatStripeTier[] }
>

export const plansSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.nativeEnum(BillingPlanType),
  description: z.string().nullable(),
  price: z.number(),
  chatsLimit: z.number().nullable(),
  storageLimit: z.number().nullable(),
  botsLimit: z.number().nullable(),
  membersLimit: z.number().nullable(),
  isSystem: z.boolean(),
  currency: z.string(),
  isYearly: z.boolean().nullable().nullable(),
  allowCustomDomain: z.boolean(),
  allowWhatsapp: z.boolean(),
  allowAnalytics: z.boolean(),
  chatTiers: z.array(chatStripeTierSchema).optional(),
  allowedBotBlocks: z.array(z.string()),
  allowGuests: z.boolean(),
  allowResults: z.boolean(),
  allowRemoveBrand: z.boolean(),
}) satisfies z.ZodType<Omit<PrismaPlan, 'createdAt' | 'updatedAt' | 'deletedAt'>>

export const planSchemaWithoutChatTiers = planSchema.omit({
  chatTiers: true,
})

export type Plan = z.infer<typeof planSchema>

export type PlanWithoutChatTiers = z.infer<typeof planSchemaWithoutChatTiers>
