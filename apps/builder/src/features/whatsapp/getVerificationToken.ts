import { authenticatedProcedure } from '@/helpers/server/trpc'
import prisma from '@quickbot.io/lib/prisma'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const getVerificationToken = authenticatedProcedure
  .input(z.object({ botId: z.string() }))
  .query(async ({ input, ctx: { user } }) => {
    if (!input.botId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Bot ID is required',
      })
    }

    // Verify user has access to this bot
    const bot = await prisma.bot.findFirst({
      where: {
        id: input.botId,
        workspace: { members: { some: { userId: user.id } } },
      },
    })

    if (!bot) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Bot not found or access denied',
      })
    }

    try {
      const verificationToken = await prisma.userVerificationToken.findFirst({
        where: { botId: input.botId },
        orderBy: { expires: 'desc' },
      })

      return {
        id: verificationToken?.id,
        token: verificationToken?.token,
      }
    } catch (error) {
      console.error('Database error in getVerificationToken:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve verification token',
      })
    }
  })
