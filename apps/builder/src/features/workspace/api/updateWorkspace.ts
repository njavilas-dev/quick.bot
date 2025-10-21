import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { workspaceSchema } from '@quickbot.io/schemas'
import { z } from 'zod'
import { isAdminWriteWorkspaceForbidden } from '@quickbot.io/db-rules/isAdminWriteWorkspaceForbidden'

export const updateWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/v1/workspaces/{workspaceId}',
      protect: true,
      summary: 'Update workspace',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      name: z.string().optional(),
      icon: z.string().optional(),
      billingEmail: z.string().optional(),
      billingCompany: z.string().optional(),
      billingVatType: z.string().optional(),
      billingVatValue: z.string().optional(),
      workspaceId: z
        .string()
        .describe('[Where to find my workspace ID?](https://docs.quick.bot/api/authentication#how-to-find-my-workspaceid)'),
    }),
  )
  .output(
    z.object({
      workspace: workspaceSchema.pick({ name: true, icon: true }),
    }),
  )
  .mutation(async ({ input: { workspaceId, ...updates }, ctx: { user } }) => {
    await prisma.workspace.updateMany({
      where: { members: { some: { userId: user.id } }, id: workspaceId },
      data: updates,
    })

    const workspace = await prisma.workspace.findFirst({
      where: { members: { some: { userId: user.id } }, id: workspaceId },
      include: { members: true },
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

    return {
      workspace,
    }
  })
