import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import prisma from '@quickbot.io/lib/prisma'
import { decrypt } from '@quickbot.io/lib/api/encryption/decrypt'
import { TRPCError } from '@trpc/server'
import { WhatsAppCredentials } from '@quickbot.io/schemas/features/whatsapp'

const inputSchema = z.object({
  credentialsId: z.string(),
})

export const getWhatsAppCredentials = authenticatedProcedure
  .input(inputSchema)
  .query(async ({ input, ctx: { user } }) => {
    const credentials = await prisma.workspaceCredential.findUnique({
      where: {
        id: input.credentialsId,
        workspace: { members: { some: { userId: user.id } } },
      },
    })
    if (!credentials)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Credentials not found',
      })

    const decryptedData = (await decrypt(
      credentials.data,
      credentials.iv,
    )) as WhatsAppCredentials['data']

    return decryptedData
  })
