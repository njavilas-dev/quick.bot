import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  edgeSchema,
  settingsSchema,
  themeSchema,
  variableSchema,
  parseGroups,
  startEventSchema,
} from '@quickbot.io/schemas'
import { z } from 'zod'
import { isWriteBotForbidden } from '../helpers/isWriteBotForbidden'
import { BillingPlanType } from '@quickbot.io/prisma'
import { botV6Schema } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { computeRiskLevel } from '@quickbot.io/radar'
import { env } from '@quickbot.io/env'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'
import { parseBotPublishEvents } from '@/features/telemetry/helpers/parseBotPublishEvents'
import { parseDefaultPublicId } from '@/features/publish/helpers/parseDefaultPublicId'
import { isPublicIdValid } from '@quickbot.io/lib'

const botPublishSchemaPick = {
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

export const publishBot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/bots/{botId}/publish',
      protect: true,
      summary: 'Publish a bot',
      tags: ['Bot'],
    },
  })
  .input(
    z.object({
      botId: z.string().describe("[Where to find my bot's ID?](https://docs.quick.bot/api/authentication#how-to-find-my-botid)"),
    }),
  )
  .output(
    z.object({
      bot: botV6Schema.pick(botPublishSchemaPick).partial(),
    }),
  )
  .mutation(async ({ input: { botId }, ctx: { user } }) => {
    const existingBot = await prisma.bot.findFirst({
      where: {
        id: botId,
      },
      include: {
        botCollaborators: true,
        publishedBot: true,
        workspace: {
          select: {
            billingPlan: true,
            isVerified: true,
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
      },
    })
    if (!existingBot?.id || (await isWriteBotForbidden(existingBot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })

    const hasFileUploadBlocks = parseGroups(existingBot.groups, {
      botVersion: existingBot.version,
    }).some((group) => group.blocks.some((block) => block.type === InputBlockType.FILE))

    if (hasFileUploadBlocks && existingBot.workspace.billingPlan.key === BillingPlanType.FREE)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "File upload blocks can't be published on the free plan",
      })

    const botWasVerified = existingBot.riskLevel === -1 || existingBot.workspace.isVerified

    if (!botWasVerified && existingBot.riskLevel && existingBot.riskLevel > 80)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'Radar detected a potential malicious bot. This bot is being manually reviewed by Fraud Prevention team.',
      })

    const riskLevel = botWasVerified
      ? 0
      : computeRiskLevel(existingBot, {
        debug: env.NODE_ENV === 'development',
      })

    if (riskLevel > 0 && riskLevel !== existingBot.riskLevel) {
      if (env.MESSAGE_WEBHOOK_URL && riskLevel !== 100 && riskLevel > 60)
        await fetch(env.MESSAGE_WEBHOOK_URL, {
          method: 'POST',
          body: `⚠️ Suspicious bot to be reviewed: ${existingBot.name} (${env.NEXTAUTH_URL}/bots/${existingBot.id}/flow) (workspace: ${existingBot.workspaceId})`,
        }).catch((err) => {
          console.error('Failed to send message', err)
        })

      await prisma.bot.updateMany({
        where: {
          id: existingBot.id,
        },
        data: {
          riskLevel,
        },
      })
      if (riskLevel > 80) {
        if (existingBot.publishedBot)
          await prisma.botPublic.deleteMany({
            where: {
              id: existingBot.publishedBot.id,
            },
          })
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Radar detected a potential malicious bot. This bot is being manually reviewed by Fraud Prevention team.',
        })
      }
    }

    const publishEvents = await parseBotPublishEvents({
      existingBot,
      userId: user.id,
      hasFileUploadBlocks,
    })

    // Generate a default publicId if not present
    if (!existingBot.publicId) {
      const generatedPublicId = parseDefaultPublicId(existingBot.name, existingBot.id)

      // Check if the generated publicId is valid and available
      if (isPublicIdValid(generatedPublicId)) {
        const isPublicIdAvailable =
          (await prisma.bot.count({
            where: { publicId: generatedPublicId },
          })) === 0

        if (isPublicIdAvailable) {
          // Update the bot with the generated publicId
          await prisma.bot.update({
            where: { id: existingBot.id },
            data: { publicId: generatedPublicId },
          })

          // Update the existingBot object with the new publicId
          existingBot.publicId = generatedPublicId
        }
      }
    }

    if (existingBot.publishedBot)
      await prisma.botPublic.updateMany({
        where: {
          id: existingBot.publishedBot.id,
        },
        data: {
          version: existingBot.version,
          edges: z.array(edgeSchema).parse(existingBot.edges),
          groups: parseGroups(existingBot.groups, {
            botVersion: existingBot.version,
          }),
          events:
            (existingBot.version === '6' ? z.tuple([startEventSchema]) : z.null()).parse(
              existingBot.events,
            ) ?? undefined,
          settings: settingsSchema.parse(existingBot.settings),
          variables: z.array(variableSchema).parse(existingBot.variables),
          theme: themeSchema.parse(existingBot.theme),
        },
      })
    else
      await prisma.botPublic.createMany({
        data: {
          version: existingBot.version,
          botId: existingBot.id,
          edges: z.array(edgeSchema).parse(existingBot.edges),
          groups: parseGroups(existingBot.groups, {
            botVersion: existingBot.version,
          }),
          events:
            (existingBot.version === '6' ? z.tuple([startEventSchema]) : z.null()).parse(
              existingBot.events,
            ) ?? undefined,
          settings: settingsSchema.parse(existingBot.settings),
          variables: z.array(variableSchema).parse(existingBot.variables),
          theme: themeSchema.parse(existingBot.theme),
        },
      })

    const parsedExistingBot = botV6Schema.parse(existingBot)

    await trackEvents([
      ...publishEvents,
      {
        name: 'Bot published',
        workspaceId: existingBot.workspaceId,
        botId: existingBot.id,
        userId: user.id,
        data: {
          name: existingBot.name,
          isFirstPublish: existingBot.publishedBot ? undefined : true,
        },
      },
    ])

    return { bot: parsedExistingBot }
  })
