import { z } from 'zod'
import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { workspaceSchema } from '@quickbot.io/schemas'

export const getWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/workspaces/{workspaceId}',
      protect: true,
      summary: 'Get workspace',
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
      workspace: workspaceSchema.omit({
        chatsLimitFirstEmailSentAt: true,
        chatsLimitSecondEmailSentAt: true,
        storageLimitFirstEmailSentAt: true,
        storageLimitSecondEmailSentAt: true,
        customStorageLimit: true,
        additionalChatsIndex: true,
        additionalStorageIndex: true,
        isQuarantined: true,
      }),
    }),
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    let workspace

    if (workspaceId) {
      workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          members: {
            some: {
              userId: user.id
            }
          },
        },
        include: {
          billingPlan: true
        },
      })
    }

    // If no workspaceId is provided or not found, we will try to find the first workspace
    if (!workspace) {
      workspace = await prisma.workspace.findFirst({
        where: {
          members: {
            some: {
              userId: user.id
            },
          },
        },
        include: {
          billingPlan: true
        },
        orderBy: { createdAt: 'asc' },
      })
    }

    if (!workspace) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No workspace available for user',
      })
    }

    /**
     * The workspace is selected where the user is a member
     * if (isReadWorkspaceFobidden(workspace, user)) {
     * throw new TRPCError({
     *  code: 'FORBIDDEN',
     *  message: 'You are not allowed to access this workspace',
     * })
    }
     */

    return {
      workspace,
    }
  })

