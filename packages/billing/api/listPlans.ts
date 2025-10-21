import prisma from '@quickbot.io/lib/prisma'

type Props = {
  chatTiers?: boolean
}

export const listPlans = async ({ chatTiers = false }: Props) => {
  const plans = await prisma.workspaceBillingPlan.findMany({
    where: {
      isSystem: true,
    },
    include: chatTiers
      ? {
          chatTiers: true,
        }
      : undefined,
  })

  return plans
}
