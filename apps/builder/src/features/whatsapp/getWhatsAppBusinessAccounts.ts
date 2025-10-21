import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { getWhatsAppBusinessAccounts } from '@quickbot.io/bot-engine/whatsapp/sendWhatsAppMessage'
import { TRPCError } from '@trpc/server'

const inputSchema = z.object({
  businessId: z.string(),
  accessToken: z.string(),
})

export const getWhatsAppBusinessAccountsQuery = authenticatedProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    try {
      const businessAccounts = await getWhatsAppBusinessAccounts({
        businessId: input.businessId,
        accessToken: input.accessToken,
      })
      return businessAccounts
    } catch (error) {
      console.error('WhatsApp API error in getWhatsAppBusinessAccounts:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch WhatsApp business accounts from WhatsApp API',
      })
    }
  })
