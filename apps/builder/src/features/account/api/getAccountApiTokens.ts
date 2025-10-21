import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { userApiTokenSchema } from '@quickbot.io/schemas'
import { z } from 'zod'

export const getAccountApiTokens = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/account/{userId}/api-tokens',
      protect: true,
      summary: 'List api token of a user',
      tags: ['User'],
    },
  })
  .input(
    z.object({
      userId: z.string(),
    }),
  )
  .output(
    z.object({
      userApiTokens: z.array(userApiTokenSchema),
    }),
  )
  .query(async ({ input: { userId } }) => {
    const apiTokens = await prisma.userApiToken.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    })

    if (!apiTokens) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })

    return {
      userApiTokens: apiTokens.map((apiToken) => ({
        id: apiToken.id,
        createdAt: apiToken.createdAt,
        token: apiToken.token,
        name: apiToken.name,
        userId: apiToken.userId,
      })),
    }
  })
