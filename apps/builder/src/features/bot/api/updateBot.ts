import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { botSchema, botV5Schema, botV6Schema } from '@quickbot.io/schemas'
import { z } from 'zod'
import {
  isCustomDomainNotAvailable,
  isPublicIdNotAvailable,
  sanitizeCustomDomain,
  sanitizeGroups,
  sanitizeSettings,
  sanitizeVariables,
} from '../helpers/sanitizers'
import { isWriteBotForbidden } from '../helpers/isWriteBotForbidden'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import { Prisma } from '@quickbot.io/prisma'
import { migrateBot } from '@quickbot.io/migrations/migrateBot'
import { isPublicIdValid } from '@quickbot.io/lib'
import { parseDefaultPublicId } from '@/features/publish/helpers/parseDefaultPublicId'

const botUpdateSchemaPick = {
  version: true,
  name: true,
  icon: true,
  selectedThemeTemplateId: true,
  groups: true,
  theme: true,
  settings: true,
  folderId: true,
  variables: true,
  edges: true,
  resultsTablePreferences: true,
  publicId: true,
  customDomain: true,
  isClosed: true,
  whatsAppCredentialsId: true,
  riskLevel: true,
  events: true,
  updatedAt: true,
} as const

export const updateBot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/v1/bots/{botId}',
      protect: true,
      summary: 'Update a bot',
      tags: ['Bot'],
    },
  })
  .input(
    z.object({
      botId: z.string().describe("[Where to find my bot's ID?](https://docs.quick.bot/api/authentication#how-to-find-my-botid)"),
      bot: z.union([
        botV6Schema.pick(botUpdateSchemaPick).partial().openapi({
          title: 'Bot V6',
        }),
        botV5Schema._def.schema.pick(botUpdateSchemaPick).partial().openapi({
          title: 'Bot V5',
        }),
      ]),
    }),
  )
  .output(
    z.object({
      bot: botV6Schema,
    }),
  )
  .mutation(async ({ input: { botId, bot }, ctx: { user } }) => {
    const existingBot = await prisma.bot.findFirst({
      where: {
        id: botId,
      },
      select: {
        version: true,
        id: true,
        customDomain: true,
        publicId: true,
        botCollaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
        workspace: {
          select: {
            id: true,
            billingPlan: true,
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
        updatedAt: true,
      },
    })

    if (!existingBot?.id || (await isWriteBotForbidden(existingBot, user)))
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Bot not found',
      })

    if (bot.updatedAt && existingBot.updatedAt.getTime() > bot.updatedAt.getTime())
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Found newer version of the bot in database',
      })

    if (
      bot.customDomain &&
      existingBot.customDomain !== bot.customDomain &&
      (await isCustomDomainNotAvailable({
        customDomain: bot.customDomain,
        workspaceId: existingBot.workspace.id,
      }))
    )
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Custom domain not available',
      })

    if (bot.publicId) {
      if (isCloudProdInstance() && bot.publicId.length < 4)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Public id should be at least 4 characters long',
        })
      if (existingBot.publicId !== bot.publicId && (await isPublicIdNotAvailable(bot.publicId)))
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Public id not available',
        })
    }

    const groups = bot.groups
      ? await sanitizeGroups(existingBot.workspace.id)(bot.groups)
      : undefined

    // Handle publicId logic
    let publicIdToUse = undefined

    if (bot.publicId === null) {
      // If specifically set to null, remove the publicId
      publicIdToUse = null
    } else if (bot.publicId && isPublicIdValid(bot.publicId)) {
      // If provided and valid, use the provided publicId
      publicIdToUse = bot.publicId
    } else if (!existingBot.publicId && bot.name) {
      // If no existing publicId and bot name is being updated, generate a default one
      const generatedPublicId = parseDefaultPublicId(bot.name, existingBot.id)

      if (isPublicIdValid(generatedPublicId)) {
        const isPublicIdAvailable = await prisma.bot.count({
          where: {
            publicId: generatedPublicId,
            id: { not: existingBot.id }
          },
        }) === 0

        if (isPublicIdAvailable) {
          publicIdToUse = generatedPublicId
        }
      }
    }

    const newBot = await prisma.bot.update({
      where: {
        id: existingBot.id,
      },
      data: {
        version: bot.version ?? undefined,
        name: bot.name,
        icon: bot.icon,
        selectedThemeTemplateId: bot.selectedThemeTemplateId,
        events: bot.events ?? undefined,
        groups,
        theme: bot.theme ? bot.theme : undefined,
        settings: bot.settings
          ? sanitizeSettings(
            bot.settings,
            existingBot.workspace.billingPlan.key,
            'update',
            existingBot?.workspace?.billingPlan?.allowWhatsapp,
          )
          : undefined,
        folderId: bot.folderId,
        variables:
          bot.variables && groups
            ? sanitizeVariables({
              variables: bot.variables,
              groups,
            })
            : undefined,
        edges: bot.edges,
        resultsTablePreferences:
          bot.resultsTablePreferences === null ? Prisma.DbNull : bot.resultsTablePreferences,
        publicId: publicIdToUse,
        customDomain: await sanitizeCustomDomain({
          customDomain: bot.customDomain,
          workspaceId: existingBot.workspace.id,
        }),
        isClosed: bot.isClosed,
        whatsAppCredentialsId: bot.whatsAppCredentialsId ?? null,
      },
    })

    const migratedBot = await migrateBot(botSchema.parse(newBot))

    return { bot: migratedBot }
  })
