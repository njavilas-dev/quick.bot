import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const getAccountNotificationSetting = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/account/notifications',
      protect: true,
      summary: 'Get notification setting',
      tags: ['Notification'],
    },
  })
  .input(z.void())
  .output(
    z.object({
      almostReachedChatsLimit: z.boolean(),
      reachedChatsLimit: z.boolean(),
      botAnswersResult: z.boolean(),
      userId: z.string(),
    }),
  )
  .query(async ({ ctx: { user } }) => {
    const notification = await prisma.userNotification.findFirst({
      where: {
        userId: user.id,
      },
    })

    if (!notification) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Notification doesn't exist`,
      })
    }

    return notification
  })
