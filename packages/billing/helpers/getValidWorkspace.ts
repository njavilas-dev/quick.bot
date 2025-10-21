import { TRPCError } from '@trpc/server'
import prisma from '@quickbot.io/lib/prisma'
import { WorkspaceRole } from '@quickbot.io/prisma'

export const getValidWorkspace = async (workspaceId: string) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId },
    select: {
      id: true,
      icon: true,
      billingPlan: true,
      name: true,
      isPastDue: true,
      stripeId: true,
      billingVatType: true,
      billingEmail: true,
      billingVatValue: true,
      billingCompany: true,
      members: {
        select: { userId: true, role: true },
        where: { role: WorkspaceRole.ADMIN },
      },
      bots: {
        select: { id: true },
      },
    },
  })

  if (!workspace) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Workspace not found',
    })
  }

  return workspace
}
