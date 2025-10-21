import ky from 'ky'
import { phone } from 'phone'
import { WhatsAppCredentials, WhatsAppSendingMessage } from '@quickbot.io/schemas/features/whatsapp'
import { env } from '@quickbot.io/env'

type Props = {
  to: string
  message: WhatsAppSendingMessage
  credentials: WhatsAppCredentials['data']
}

const TEST_NUMBERS: Record<string, string> = {
  '542215676835': '54221155676835',
  '542214095375': '54221154095375',
}

const getPhoneNumber = (to: string) => {
  if (!to.startsWith('+')) {
    to = `+${to}`
  }
  let { phoneNumber } = phone(to)
  if (!phoneNumber) {
    throw new Error(`Invalid phone number: ${to}`)
  }

  if (phoneNumber.startsWith('+')) {
    phoneNumber = phoneNumber.substring(1)
  }

  if (TEST_NUMBERS[phoneNumber]) {
    phoneNumber = TEST_NUMBERS[phoneNumber]
  }

  return phoneNumber
}

export const sendWhatsAppMessage = async ({ to, message, credentials }: Props) => {
  const phoneNumber = getPhoneNumber(to)

  console.log('Message sent:', {
    to,
    phoneNumber,
    message,
    credentials,
  })

  return ky.post(`${env.WHATSAPP_CLOUD_API_URL}/v22.0/${credentials.phoneNumberId}/messages`, {
    headers: {
      Authorization: `Bearer ${credentials.systemUserAccessToken}`,
    },
    json: {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      ...message,
    },
  })
}
type TypingProps = {
  incomingMessageId: string
  credentials: WhatsAppCredentials['data']
}

/**
 * The indicator will be dismissed once we respond or after 25 seconds, whichever comes first.
 */
export const sendWhatsAppTypingIndicator = async ({
  incomingMessageId,
  credentials,
}: TypingProps) => {
  try {
    return await ky.post(
      `${env.WHATSAPP_CLOUD_API_URL}/v22.0/${credentials.phoneNumberId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${credentials.systemUserAccessToken}`,
        },
        json: {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: incomingMessageId,
          typing_indicator: {
            type: 'text',
          },
        },
      },
    )
  } catch (error) {
    console.error('Failed to send typing indicator:', error)
  }
}

type PhoneNumberProps = {
  businessId: string
  accessToken: string
}

export type WhatsAppPhoneNumber = {
  id: string
  verified_name: string
  display_phone_number: string
}

export const getWhatsAppPhoneNumberId = async ({
  businessId,
  accessToken,
}: PhoneNumberProps): Promise<WhatsAppPhoneNumber[] | undefined> => {
  try {
    const response: any = await ky
      .get(`${env.WHATSAPP_CLOUD_API_URL}/v23.0/${businessId}/phone_numbers`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .json()

    return response.data.map((phoneNumber: any) => ({
      id: phoneNumber.id,
      verified_name: phoneNumber.verified_name,
      display_phone_number: phoneNumber.display_phone_number,
    }))
  } catch (error) {
    console.error('Failed to get phone numbers:', error)
  }
}

type WhatsAppBusinessProps = {
  businessId: string
  accessToken: string
}

export type WhatsAppBusinessAccount = {
  id: string
  name: string
}

export const getWhatsAppBusinessAccounts = async ({
  businessId,
  accessToken,
}: WhatsAppBusinessProps): Promise<WhatsAppBusinessAccount[] | undefined> => {
  try {
    const response: any = await ky
      .get(`${env.WHATSAPP_CLOUD_API_URL}/v23.0/${businessId}/owned_whatsapp_business_accounts`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .json()

    return response.data.map((account: any) => ({
      id: account.id,
      name: account.name,
    }))
  } catch (error) {
    console.error('Failed to get WhatsApp business accounts:', error)
  }
}
