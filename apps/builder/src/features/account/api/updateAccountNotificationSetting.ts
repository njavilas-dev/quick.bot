import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const updateAccountNotificationSetting = authenticatedProcedure
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/v1/account/notifications',
      protect: true,
      summary: 'Update notification setting',
      tags: ['Notification'],
    },
  })
  .input(z.object({ key: z.string(), value: z.boolean() }))
  .output(
    z.object({
      message: z.literal('success'),
    }),
  )
  .mutation(async ({ input: { key, value }, ctx: { user } }) => {
    const notificationSettings = [
      'almostReachedChatsLimit',
      'reachedChatsLimit',
      'botAnswersResult',
    ]

    const notificationSetting = notificationSettings.find((setting) => setting === key)

    if (!notificationSetting) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Notification key doesn't exist`,
      })
    }

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

    const data = {
      ...(notificationSetting === 'almostReachedChatsLimit'
        ? { almostReachedChatsLimit: value }
        : {}),
      ...(notificationSetting === 'reachedChatsLimit' ? { reachedChatsLimit: value } : {}),
      ...(notificationSetting === 'botAnswersResult' ? { botAnswersResult: value } : {}),
    }

    await prisma.userNotification.update({
      where: {
        userId: user.id,
      },
      data: data,
    })

    return { message: 'success' }
  })
