import { authenticatedProcedure } from '@/helpers/server/trpc'
import prisma from '@quickbot.io/lib/prisma'
import { z } from 'zod'

export const deleteVerificationTokensByBotId = authenticatedProcedure
  .input(z.object({ botId: z.string() }))
  .mutation(async ({ input }) => {
    const deleted = await prisma.userVerificationToken.deleteMany({
      where: { botId: { contains: input.botId } },
    })
    return { count: deleted.count }
  })
