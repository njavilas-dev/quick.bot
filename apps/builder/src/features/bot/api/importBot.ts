import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { WorkspaceRole, BillingPlanType } from '@quickbot.io/prisma'
import {
  Bot,
  BotV6,
  resultsTablePreferencesSchema,
  botV5Schema,
  botV6Schema,
} from '@quickbot.io/schemas'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'
import {
  sanitizeFolderId,
  sanitizeGroups,
  sanitizeSettings,
  sanitizeVariables,
} from '../helpers/sanitizers'
import { preprocessBot } from '@quickbot.io/schemas/features/bot/helpers/preprocessBot'
import { migrateBot } from '@quickbot.io/migrations/migrateBot'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'

const omittedProps = {
  id: true,
  whatsAppCredentialsId: true,
  riskLevel: true,
  isClosed: true,
  isArchived: true,
  createdAt: true,
  updatedAt: true,
  customDomain: true,
  workspaceId: true,
  resultsTablePreferencesSchema: true,
  selectedThemeTemplateId: true,
  publicId: true,
} as const

const importingBotSchema = z.preprocess(
  preprocessBot,
  z.discriminatedUnion('version', [
    botV6Schema
      .omit(omittedProps)
      .extend({
        resultsTablePreferences: resultsTablePreferencesSchema.nullish(),
        selectedThemeTemplateId: z.string().nullish(),
      })
      .openapi({
        title: 'Bot V6',
      }),
    botV5Schema._def.schema
      .omit(omittedProps)
      .extend({
        resultsTablePreferences: resultsTablePreferencesSchema.nullish(),
        selectedThemeTemplateId: z.string().nullish(),
      })
      .openapi({
        title: 'Bot V5',
      }),
  ]),
)

type ImportingBot = z.infer<typeof importingBotSchema>

const migrateImportingBot = (bot: ImportingBot): Promise<BotV6> => {
  const fullBot = {
    ...bot,
    id: 'dummy id',
    workspaceId: 'dummy workspace id',
    resultsTablePreferences: bot.resultsTablePreferences ?? null,
    selectedThemeTemplateId: bot.selectedThemeTemplateId ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customDomain: null,
    isClosed: false,
    isArchived: false,
    whatsAppCredentialsId: null,
    publicId: null,
    riskLevel: null,
  } satisfies Bot
  return migrateBot(fullBot)
}

export const importBot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/bots/import',
      protect: true,
      summary: 'Import a bot',
      tags: ['Bot'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe('[Where to find my workspace ID?](https://docs.quick.bot/api/authentication#how-to-find-my-workspaceid)'),
      bot: importingBotSchema,
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

    const migratedBot = await migrateImportingBot(bot)

    const groups = (
      migratedBot.groups ? await sanitizeGroups(workspaceId)(migratedBot.groups) : []
    ) as BotV6['groups']

    const newBot = await prisma.bot.create({
      data: {
        version: '6',
        workspaceId,
        name: migratedBot.name,
        icon: migratedBot.icon,
        selectedThemeTemplateId: migratedBot.selectedThemeTemplateId,
        groups,
        events: migratedBot.events ?? undefined,
        theme: migratedBot.theme ? migratedBot.theme : {},
        settings: migratedBot.settings
          ? sanitizeSettings(
            migratedBot.settings,
            workspace.billingPlan.key,
            'create',
            workspace?.billingPlan?.allowWhatsapp,
          )
          : workspace.billingPlan.key === BillingPlanType.FREE
            ? {
              general: {
                isBrandingEnabled: true,
              },
            }
            : {},
        folderId: await sanitizeFolderId({
          folderId: migratedBot.folderId,
          workspaceId: workspace.id,
        }),
        variables: migratedBot.variables
          ? sanitizeVariables({ variables: migratedBot.variables, groups })
          : [],
        edges: migratedBot.edges ?? [],
        resultsTablePreferences: migratedBot.resultsTablePreferences ?? undefined,
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
