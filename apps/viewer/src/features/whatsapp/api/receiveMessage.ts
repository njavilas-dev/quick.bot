import { publicProcedure } from '@/helpers/server/trpc'
import { whatsAppWebhookRequestBodySchema } from '@quickbot.io/schemas/features/whatsapp'
import { z } from 'zod'
import { isNotDefined } from '@quickbot.io/lib'
import { resumeWhatsAppFlow } from '@quickbot.io/bot-engine/whatsapp/resumeWhatsAppFlow'
import { getSession } from '@quickbot.io/bot-engine/queries/getSession'

export const receiveMessage = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/workspaces/{workspaceId}/whatsapp/{credentialsId}/webhook',
      summary: 'Message webhook',
      tags: ['WhatsApp'],
    },
  })
  .input(
    z
      .object({ workspaceId: z.string(), credentialsId: z.string() })
      .merge(whatsAppWebhookRequestBodySchema),
  )
  .output(
    z.object({
      message: z.string(),
    }),
  )
  .mutation(async ({ input: { entry, credentialsId, workspaceId } }) => {
    const receivedMessage = entry.at(0)?.changes.at(0)?.value.messages?.at(0)
    if (isNotDefined(receivedMessage)) return { message: 'No message found' }
    const contactName = entry.at(0)?.changes.at(0)?.value?.contacts?.at(0)?.profile?.name ?? ''
    const contactPhoneNumber = entry.at(0)?.changes.at(0)?.value?.messages?.at(0)?.from ?? ''
    const phoneNumberId = entry.at(0)?.changes.at(0)?.value.metadata.phone_number_id
    if (!phoneNumberId) return { message: 'No phone number id found' }

    const sessionId = `wa-${phoneNumberId}-${receivedMessage.from}`

    const existingSession = await getSession(sessionId)

    if (existingSession?.lastWhatsAppMessageId === receivedMessage.id) {
      console.log('Message already processed, skipping...', {
        messageId: receivedMessage.id,
        sessionId,
      })
      return { message: 'Message already processed' }
    }

    return resumeWhatsAppFlow({
      receivedMessage,
      sessionId,
      phoneNumberId,
      credentialsId,
      workspaceId,
      contact: {
        name: contactName,
        phoneNumber: contactPhoneNumber,
      },
    })
  })
