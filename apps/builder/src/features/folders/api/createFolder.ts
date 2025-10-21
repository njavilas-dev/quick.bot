import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { WorkspaceDashboardFolder, BillingPlanType, WorkspaceRole } from '@quickbot.io/prisma'
import { folderSchema } from '@quickbot.io/schemas'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'

export const createFolder = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/folders',
      protect: true,
      summary: 'Create a folder',
      tags: ['Folder'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      folderName: z.string().default(''),
      parentFolderId: z.string().optional(),
    }),
  )
  .output(
    z.object({
      folder: folderSchema,
    }),
  )
  .mutation(async ({ input: { folderName, parentFolderId, workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, members: true, billingPlan: true },
    })
    const userRole = getUserRoleInWorkspace(user.id, workspace?.members)
    if (userRole === undefined || userRole === WorkspaceRole.GUEST || !workspace)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      })

    if (workspace.billingPlan.key === BillingPlanType.FREE)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You need to upgrade to a paid plan to create folders',
      })

    const newFolder = await prisma.workspaceDashboardFolder.create({
      data: {
        workspaceId,
        name: folderName,
        parentFolderId,
      } satisfies Partial<WorkspaceDashboardFolder>,
    })

    await trackEvents([
      {
        name: 'Folder created',
        userId: user.id,
        workspaceId,
      },
    ])

    return { folder: folderSchema.parse(newFolder) }
  })
