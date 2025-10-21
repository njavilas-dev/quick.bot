import { PrismaClient } from '@prisma/client'
import {
  personalChatTiers,
  businessChatTiers,
  enterpriseChatTiers,
} from '../../scripts/chatTiers.js'

const prisma = new PrismaClient()

const allowedBotBlocks = [
  'text',
  'image',
  'text input',
  'buttons input',
  'number input',
  'email input',
  'url input',
  'phone number input',
  'buttons input',
  'date input',
  'Set variable',
  'Condition',
  'Redirect',
  'Email',
  'Google Sheets',
  'wordpress',
  'woocommerce',
  'freshdesk',
  'openai'
]

export const plans = [
  {
    name: 'Free',
    key: 'FREE' as const,
    description:
      'Perfect for getting started with basic chatbot functionality and exploring our platform features',
    price: 0,
    currency: 'usd',
    chatsLimit: 200,
    storageLimit: null,
    botsLimit: 1,
    membersLimit: 1,
    isSystem: true,
    isYearly: false,
    allowCustomDomain: false,
    allowWhatsapp: false,
    allowAnalytics: false,
    allowedBotBlocks,
    allowGuests: false,
    allowResults: false,
    allowRemoveBrand: false,
  },
  {
    name: 'Personal',
    key: 'PERSONAL' as const,
    description:
      'Ideal for individuals and small projects who need more conversations and team collaboration',
    price: 49,
    currency: 'usd',
    chatsLimit: 2000,
    storageLimit: null,
    botsLimit: 1,
    membersLimit: 2,
    isSystem: true,
    isYearly: false,
    allowCustomDomain: false,
    allowWhatsapp: true,
    allowAnalytics: false,
    allowedBotBlocks,
    allowGuests: false,
    allowResults: false,
    allowRemoveBrand: false,
  },
  {
    name: 'Business',
    key: 'BUSINESS' as const,
    description:
      'Designed for growing businesses with advanced features like custom domains, WhatsApp integration, and analytics',
    price: 99,
    currency: 'usd',
    chatsLimit: 10000,
    storageLimit: null,
    botsLimit: 5,
    membersLimit: 5,
    isSystem: true,
    isYearly: false,
    allowCustomDomain: false,
    allowWhatsapp: true,
    allowAnalytics: true,
    allowedBotBlocks,
    allowGuests: false,
    allowResults: true,
    allowRemoveBrand: true,
  },
  {
    name: 'Enterprise',
    key: 'ENTERPRISE' as const,
    description:
      'Comprehensive solution for large organizations requiring high-volume conversations and extensive team management',
    price: 149,
    currency: 'usd',
    chatsLimit: 50000,
    storageLimit: null,
    botsLimit: 9999,
    membersLimit: 9999,
    isSystem: true,
    isYearly: false,
    allowCustomDomain: true,
    allowWhatsapp: true,
    allowAnalytics: true,
    allowedBotBlocks,
    allowGuests: true,
    allowResults: true,
    allowRemoveBrand: true,
  },
  {
    name: 'Unlimited',
    key: 'UNLIMITED' as const,
    description:
      'Maximum flexibility with unlimited conversations, bots, and team members for enterprise-scale operations',
    price: 999,
    currency: 'usd',
    chatsLimit: 1000000,
    storageLimit: null,
    botsLimit: 9999,
    membersLimit: 9999,
    isSystem: true,
    isYearly: false,
    allowCustomDomain: true,
    allowWhatsapp: true,
    allowAnalytics: true,
    allowedBotBlocks: [],
    allowGuests: true,
    allowResults: true,
    allowRemoveBrand: true,
  },
]

async function main() {
  const mapStripeTierToPrisma = (t: any) => ({
    upTo: t.up_to === 'inf' ? null : t.up_to,
    flatAmount: t.flat_amount ?? null,
    flatAmountDecimal: t.flat_amount_decimal ?? null,
    unitAmount: t.unit_amount ?? null,
    unitAmountDecimal: t.unit_amount_decimal ?? null,
    isInfinite: t.up_to === 'inf',
  })

  // Create or update workspace billing plans
  for (const plan of plans) {
    const existingPlan = await prisma.workspaceBillingPlan.findFirst({
      where: {
        key: plan.key,
        isSystem: true,
      },
    })

    let currentPlan
    if (existingPlan) {
      currentPlan = await prisma.workspaceBillingPlan.update({
        where: { id: existingPlan.id },
        data: plan,
      })
    } else {
      currentPlan = await prisma.workspaceBillingPlan.create({
        data: plan,
      })
    }

    // ----------------- Chat tiers -----------------
    if (['PERSONAL', 'BUSINESS', 'ENTERPRISE'].includes(plan.key)) {
      const source =
        plan.key === 'PERSONAL'
          ? personalChatTiers
          : plan.key === 'BUSINESS'
            ? businessChatTiers
            : enterpriseChatTiers

      // Remove previous tiers (idempotent seed)
      await prisma.workspaceBillingPlanTier.deleteMany({
        where: { billingPlanId: currentPlan.id },
      })

      await prisma.workspaceBillingPlanTier.createMany({
        data: source.map((t: any) => ({
          ...mapStripeTierToPrisma(t),
          billingPlanId: currentPlan.id,
        })),
      })
    }
  }

  // Notificaciones por usuario (según migración Notification)
  const users = await prisma.user.findMany()
  for (const user of users) {
    await prisma.userNotification.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        almostReachedChatsLimit: true,
        reachedChatsLimit: true,
        botAnswersResult: true,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
