import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { workspaceSchema } from '@quickbot.io/schemas'
import { z } from 'zod'

export const listWorkspaces = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/workspaces',
      protect: true,
      summary: 'List workspaces',
      tags: ['Workspace'],
    },
  })
  .input(z.void())
  .output(
    z.object({
      workspaces: z.array(
        workspaceSchema.pick({ id: true, name: true, icon: true, billingPlan: true }),
      ),
    }),
  )
  .query(async ({ ctx: { user } }) => {
    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId: user.id } } },
      select: {
        name: true,
        id: true,
        icon: true,
        billingPlan: {
          select: {
            id: true,
            key: true,
            name: true,
            description: true,
            price: true,
            currency: true,
            chatsLimit: true,
            storageLimit: true,
            botsLimit: true,
            membersLimit: true,
            isSystem: true,
            isYearly: true,
            allowCustomDomain: true,
            allowWhatsapp: true,
            allowAnalytics: true,
            allowedBotBlocks: true,
            allowGuests: true,
            allowResults: true,
            allowRemoveBrand: true,
          },
        },
      },
    })

    if (!workspaces) throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    return { workspaces }
  })
