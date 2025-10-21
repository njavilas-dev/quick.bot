import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { getWhatsAppPhoneNumberId } from '@quickbot.io/bot-engine/whatsapp/sendWhatsAppMessage'
import { TRPCError } from '@trpc/server'

const inputSchema = z.object({
  businessId: z.string(),
  accessToken: z.string(),
})

export const getPhoneNumbers = authenticatedProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    try {
      const phoneNumbers = await getWhatsAppPhoneNumberId({
        businessId: input.businessId,
        accessToken: input.accessToken,
      })
      return phoneNumbers
    } catch (error) {
      console.error('WhatsApp API error in getPhoneNumbers:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch phone numbers from WhatsApp API',
      })
    }
  })
