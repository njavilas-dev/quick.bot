import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import ky from 'ky'
import prisma from '@quickbot.io/lib/prisma'
import { decrypt } from '@quickbot.io/lib/api/encryption/decrypt'
import { TRPCError } from '@trpc/server'
import { WhatsAppCredentials } from '@quickbot.io/schemas/features/whatsapp'
import { env } from '@quickbot.io/env'

const inputSchema = z.object({
  credentialsId: z.string().optional(),
  systemToken: z.string().optional(),
  phoneNumberId: z.string().optional(),
})

export const getPhoneNumber = authenticatedProcedure
  .input(inputSchema)
  .query(async ({ input, ctx: { user } }) => {
    const credentials = await getCredentials(user.id, input)
    if (!credentials)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Credentials not found',
      })
    try {
      const { display_phone_number } = await ky
        .get(`${env.WHATSAPP_CLOUD_API_URL}/v22.0/${credentials.phoneNumberId}`, {
          headers: {
            Authorization: `Bearer ${credentials.systemUserAccessToken}`,
          },
        })
        .json<{ display_phone_number: string }>()

      const formattedPhoneNumber = `${
        display_phone_number.startsWith('+') ? '' : '+'
      }${display_phone_number.replace(/[\s-]/g, '')}`

      return {
        id: credentials.phoneNumberId,
        name: formattedPhoneNumber,
      }
    } catch (error) {
      console.error('WhatsApp API error in getPhoneNumber:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch phone number from WhatsApp API',
      })
    }
  })

const getCredentials = async (
  userId: string,
  input: z.infer<typeof inputSchema>,
): Promise<WhatsAppCredentials['data'] | undefined> => {
  if (input.systemToken && input.phoneNumberId) {
    return {
      systemUserAccessToken: input.systemToken,
      phoneNumberId: input.phoneNumberId,
    }
  }

  if (!input.credentialsId) return
  const credentials = await prisma.workspaceCredential.findUnique({
    where: {
      id: input.credentialsId,
      workspace: { members: { some: { userId } } },
    },
  })
  if (!credentials) return
  return (await decrypt(credentials.data, credentials.iv)) as WhatsAppCredentials['data']
}
