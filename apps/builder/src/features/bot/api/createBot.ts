import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { WorkspaceRole, BillingPlanType } from '@quickbot.io/prisma'
import { BotV6, botV6Schema } from '@quickbot.io/schemas'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'
import {
  isCustomDomainNotAvailable,
  isPublicIdNotAvailable,
  sanitizeGroups,
  sanitizeSettings,
  sanitizeVariables,
} from '../helpers/sanitizers'
import { createId } from '@quickbot.io/lib/createId'
import { EventType } from '@quickbot.io/schemas/features/events/constants'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'

const botCreateSchemaPick = {
  name: true,
  icon: true,
  selectedThemeTemplateId: true,
  groups: true,
  events: true,
  theme: true,
  settings: true,
  folderId: true,
  variables: true,
  edges: true,
  resultsTablePreferences: true,
  publicId: true,
  customDomain: true,
} as const

export const createBot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/bots',
      protect: true,
      summary: 'Create a bot',
      tags: ['Bot'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      bot: botV6Schema.pick(botCreateSchemaPick).partial(),
    }),
  )
  .output(
    z.object({
      bot: botV6Schema,
    }),
  )
  .mutation(async ({ input: { bot, workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, members: true, billingPlan: true },
    })
    const userRole = getUserRoleInWorkspace(user.id, workspace?.members)
    if (userRole === undefined || userRole === WorkspaceRole.GUEST || !workspace)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    if (
      bot.customDomain &&
      (await isCustomDomainNotAvailable({
        customDomain: bot.customDomain,
        workspaceId,
      }))
    )
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Custom domain not available',
      })

    if (bot.publicId && (await isPublicIdNotAvailable(bot.publicId)))
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Public id not available',
      })

    if (bot.folderId) {
      const existingFolder = await prisma.workspaceDashboardFolder.findUnique({
        where: {
          id: bot.folderId,
        },
      })
      if (!existingFolder) bot.folderId = null
    }

    const groups = (
      bot.groups ? await sanitizeGroups(workspaceId)(bot.groups) : []
    ) as BotV6['groups']
    const newBot = await prisma.bot.create({
      data: {
        version: '6',
        workspaceId,
        name: bot.name ?? 'My Bot',
        icon: bot.icon,
        selectedThemeTemplateId: bot.selectedThemeTemplateId,
        groups,
        events: bot.events ?? [
          {
            type: EventType.START,
            graphCoordinates: { x: 0, y: 0 },
            id: createId(),
          },
        ],
        theme: bot.theme ? bot.theme : {},
        settings: bot.settings
          ? sanitizeSettings(
            bot.settings,
            workspace.billingPlan.key,
            'create',
            workspace?.billingPlan?.allowWhatsapp,
          )
          : workspace.billingPlan.key === BillingPlanType.FREE
            ? {
              general: { isBrandingEnabled: true },
            }
            : {},
        folderId: bot.folderId,
        variables: bot.variables ? sanitizeVariables({ variables: bot.variables, groups }) : [],
        edges: bot.edges ?? [],
        resultsTablePreferences: bot.resultsTablePreferences ?? undefined,
        publicId: bot.publicId ?? undefined,
        customDomain: bot.customDomain ?? undefined,
      } satisfies Partial<BotV6>,
    })

    const parsedNewBot = botV6Schema.parse(newBot)

    await trackEvents([
      {
        name: 'Bot created',
        workspaceId: parsedNewBot.workspaceId,
        botId: parsedNewBot.id,
        userId: user.id,
        data: {
          name: newBot.name,
        },
      },
    ])

    return { bot: parsedNewBot }
  })
