import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import prisma from '@quickbot.io/lib/prisma'

const inputSchema = z.object({
  credentialsId: z.string().optional().nullable(),
  currentBotId: z.string().optional().nullable(),
})

const outputSchema = z.object({
  isAssigned: z.boolean(),
})

export const checkWhatsAppCredentialId = authenticatedProcedure
  .input(inputSchema)
  .output(outputSchema)
  .mutation(async ({ input }) => {
    const { credentialsId, currentBotId } = input

    if (!credentialsId || !currentBotId) {
      return {
        isAssigned: false,
      }
    }

    const botsUsingCredentials = await prisma.bot.findMany({
      where: {
        whatsAppCredentialsId: credentialsId,
        ...(currentBotId && { id: { not: currentBotId } }),
      },
      select: {
        id: true,
        name: true,
      },
    })

    const isAssigned = botsUsingCredentials.length > 0

    return {
      isAssigned,
    }
  })
