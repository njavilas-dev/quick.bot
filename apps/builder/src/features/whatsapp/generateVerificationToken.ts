import { authenticatedProcedure } from '@/helpers/server/trpc'
import prisma from '@quickbot.io/lib/prisma'
import { createId } from '@quickbot.io/lib/createId'

import { z } from 'zod'

export const generateVerificationToken = authenticatedProcedure
  .input(z.object({ botId: z.string() }))
  .mutation(async ({ input }) => {
    const oneHourLater = new Date(Date.now() + 1000 * 60 * 60)
    const verificationToken = await prisma.userVerificationToken.create({
      data: {
        botId: input.botId,
        token: createId(),
        expires: oneHourLater,
        identifier: 'whatsapp webhook',
      },
    })

    return { verificationToken: verificationToken.token }
  })
