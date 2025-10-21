import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { WorkspaceRole } from '@quickbot.io/prisma'
import { PublicBot, Bot, botV5Schema } from '@quickbot.io/schemas'
import { omit } from '@quickbot.io/lib'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'

export const listBots = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/bots',
      protect: true,
      summary: 'List bots',
      tags: ['Bot'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe('[Where to find my workspace ID?](https://docs.quick.bot/api/authentication#how-to-find-my-workspaceid)'),
      folderId: z.string().optional(),
    }),
  )
  .output(
    z.object({
      bots: z.array(
        botV5Schema._def.schema
          .pick({
            name: true,
            icon: true,
            id: true,
            publicId: true,
            customDomain: true,
          })
          .merge(
            z.object({
              publishedBotId: z.string().optional(),
              totalViews: z.number().optional(),
              totalStarts: z.number().optional(),
              totalCompleted: z.number().optional(),
            }),
          ),
      ),
    }),
  )
  .query(async ({ input: { workspaceId, folderId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { members: true },
    })
    const userRole = getUserRoleInWorkspace(user.id, workspace?.members)
    if (userRole === undefined)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })
    const bots = (
      await prisma.bot.findMany({
        where: {
          isArchived: { not: true },
          folderId:
            userRole === WorkspaceRole.GUEST ? undefined : folderId === 'root' ? null : folderId,
          workspaceId,
          botCollaborators:
            userRole === WorkspaceRole.GUEST ? { some: { userId: user.id } } : undefined,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          name: true,
          publishedBot: { select: { id: true } },
          id: true,
          icon: true,
          publicId: true,
          customDomain: true,
        },
      })
    ).map((bot) => ({ ...bot, publishedBot: bot.publishedBot })) as (Pick<
      Bot,
      'name' | 'id' | 'icon' | 'publicId' | 'customDomain'
    > & {
      publishedBot: Pick<PublicBot, 'id'>
    })[]

    if (!bots) throw new TRPCError({ code: 'NOT_FOUND', message: 'No bots found' })

    const botCounts = await Promise.all(
      bots.map(async (bot) => {
        const [totalViews, totalStarts, totalCompleted] = await prisma.$transaction([
          prisma.botResult.count({
            where: {
              botId: bot.id,
              isArchived: false,
            },
          }),
          prisma.botResult.count({
            where: {
              botId: bot.id,
              isArchived: false,
              hasStarted: true,
            },
          }),
          prisma.botResult.count({
            where: {
              botId: bot.id,
              isArchived: false,
              isCompleted: true,
            },
          }),
        ])
        return { ...bot, totalViews, totalStarts, totalCompleted }
      }),
    )

    return {
      bots: botCounts.map((bot) => ({
        publishedBotId: bot.publishedBot?.id,
        ...omit(bot, 'publishedBot'),
      })),
    }
  })
