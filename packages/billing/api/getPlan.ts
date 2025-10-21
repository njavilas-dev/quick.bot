import { TRPCError } from '@trpc/server'
import prisma from '@quickbot.io/lib/prisma'
import { BillingPlanType } from '@quickbot.io/prisma'

type Props = {
  planId?: string
  key?: BillingPlanType
}

export const getPlan = async ({ planId, key }: Props) => {
  if (!planId && key === BillingPlanType.CUSTOM)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Custom plan required plan id',
    })

  const plan = await prisma.workspaceBillingPlan.findFirst({
    where: {
      ...(planId ? { id: planId } : {}),
      ...(key ? { key } : {}),
    },
    include: {
      chatTiers: true,
    },
  })

  if (!plan)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Plan not found',
    })

  return plan
}
