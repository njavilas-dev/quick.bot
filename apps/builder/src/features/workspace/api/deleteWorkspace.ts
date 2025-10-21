import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { env } from '@quickbot.io/env'
import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { removeObjectsFromWorkspace } from '@quickbot.io/lib/s3/removeObjectsRecursively'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'
import { StripeService } from '@quickbot.io/billing/services/StripeService'
import { isAdminWriteWorkspaceForbidden } from '@quickbot.io/db-rules/isAdminWriteWorkspaceForbidden'

export const deleteWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/v1/workspaces/{workspaceId}',
      protect: true,
      summary: 'Delete workspace',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe('[Where to find my workspace ID?](https://docs.quick.bot/api/authentication#how-to-find-my-workspaceid)'),
    }),
  )
  .output(
    z.object({
      message: z.string(),
    }),
  )
  .mutation(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      include: { members: true, billingPlan: true },
    })

    if (!workspace) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      })
    }

    if (isAdminWriteWorkspaceForbidden(workspace, user)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not allowed to update this workspace',
      })
    }

    await prisma.workspace.deleteMany({
      where: { id: workspaceId },
    })

    if (env.S3_BUCKET) {
      await removeObjectsFromWorkspace(workspaceId)
    }

    if (workspace.stripeId) {
      const stripe = new StripeService()
      stripe.cancelSubscription(workspace.stripeId)
    }

    await trackEvents([
      {
        name: 'Workspace deleted',
        workspaceId: workspace.id,
        userId: user.id,
        data: {
          name: workspace.name,
          billingPlan: workspace.billingPlan.key,
        },
      },
    ])

    return {
      message: 'Workspace deleted',
    }
  })
