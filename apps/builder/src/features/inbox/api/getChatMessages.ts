import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import prisma from '@quickbot.io/lib/prisma'
import { sessionStateSchema } from '@quickbot.io/schemas'
import { isReadBotForbidden } from '@/features/bot/helpers/isReadBotForbidden'
import { MessageBuilder } from '../helpers/messageBuilder'
import { GroupNavigator, findStartGroupId } from '../helpers/groupNavigator'
import { isBubbleBlock, isInputBlock } from '../helpers/blockTypeCheckers'
import { chatMessageSchema } from '../types'
import type { Bot } from '@quickbot.io/schemas'
import type { Answer } from '../helpers/messageBuilder'

const inputSchema = z.object({
  botId: z.string().describe('The bot ID'),
  resultId: z.string().describe('The chat session ID or result ID'),
})

const outputSchema = z.object({
  messages: z.array(chatMessageSchema),
})

export const getChatMessages = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/inbox/{botId}/{resultId}/messages',
      protect: true,
      summary: 'Get chat messages history for a session',
      tags: ['Inbox'],
    },
  })
  .input(inputSchema)
  .output(outputSchema)
  .query(async ({ input: { botId, resultId }, ctx: { user } }) => {
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              select: { userId: true },
            },
          },
        },
        botCollaborators: {
          select: { userId: true },
        },
      },
    })

    if (!bot || (await isReadBotForbidden(bot, user))) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })
    }

    const botResult = await prisma.botResult.findFirst({
      where: {
        botId,
        isArchived: { not: true },
        OR: [{ id: resultId }, { lastChatSessionId: resultId }],
      },
      select: {
        id: true,
        lastChatSessionId: true,
        createdAt: true,
      },
    })

    if (!botResult) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Result not found' })
    }

    if (!botResult.lastChatSessionId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No chat session associated with this result',
      })
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: botResult.lastChatSessionId },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        state: true,
      },
    })

    if (!session) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat session not found' })
    }

    const parsed = sessionStateSchema.safeParse(session.state)
    if (!parsed.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse session state',
        cause: parsed.error,
      })
    }

    const sessionState = parsed.data

    const currentBotQueue = sessionState.botsQueue[0]
    if (!currentBotQueue) {
      return { messages: [] }
    }

    const currentBot = currentBotQueue.bot
    const answers = currentBotQueue.answers || []
    const variables = currentBot.variables || []

    const startGroupId = findStartGroupId(currentBot as Bot)
    if (!startGroupId) {
      return { messages: [] }
    }

    const messageBuilder = new MessageBuilder(session.createdAt)
    const navigator = new GroupNavigator(currentBot as Bot, startGroupId)

    let currentAnswerIndex = 0

    for (const { group } of navigator.walkGroups()) {
      for (const block of group.blocks) {
        if (isBubbleBlock(block.type)) {
          messageBuilder.addBotMessage(block, variables, group.id)
        }
        if (isInputBlock(block.type)) {
          const currentAnswer = answers[currentAnswerIndex]

          if (currentAnswer !== undefined) {
            messageBuilder.addUserMessage(currentAnswer as unknown as Answer, block)
            currentAnswerIndex++
          } else {
            return { messages: messageBuilder.build() }
          }
        }
      }
    }

    return { messages: messageBuilder.build() }
  })
