import { createAction, option } from '@quickbot.io/forge'
import { auth } from '../auth'
import axios from 'axios'
import qs from 'qs'

type Phone = 'phone'
type Message = 'message'
type Token = 'token'

function validate<T extends Phone | Message | Token>(type: T, value: string): boolean {
  switch (type) {
    case 'phone':
      const phoneRegex = /^\+?\d+$/
      return phoneRegex.test(value)
    case 'message':
      const messageRegex = /^[A-Za-z0-9\s.,!?]{1,500}$/
      return messageRegex.test(value)
    case 'token':
      const tokenRegex = /^[A-Za-z0-9]+$/
      return tokenRegex.test(value)
    default:
      return false
  }
}

export const sendMessage = createAction({
  auth,
  name: 'Send Message',
  options: option.object({
    body: option.string.layout({
      label: 'Body',
      isRequired: true,
      moreInfoTooltip: 'Message body, maximum 500 characters.',
    }),
    to: option.string.layout({
      label: 'To',
      isRequired: true,
      moreInfoTooltip: "Recipient's phone number, ex : +542323123456",
    }),
    from: option.string.layout({
      label: 'From',
      isRequired: true,
      moreInfoTooltip: 'Your Twilio number, ex : +542323123456',
    }),
  }),
  run: {
    server: async ({
      credentials: { authToken, accountSid },
      options: { body, to, from },
      logs,
    }) => {
      if (
        !(
          validate<Message>('message', String(body)) &&
          validate<Phone>('phone', String(to)) &&
          validate<Phone>('phone', String(from)) &&
          validate<Token>('token', String(authToken)) &&
          validate<Token>('token', String(accountSid))
        )
      ) {
        return logs.add({
          status: 'error',
          description:
            'Impossible to send message without the correct configuration parameters, check.',
        })
      }
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
      try {
        await axios.post(
          url,
          qs.stringify({
            From: String(from),
            To: String(to),
            Body: String(body),
          }),
          {
            auth: {
              username: String(accountSid),
              password: String(authToken),
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        return logs.add({ status: 'success', description: 'Sending message for Twilio.com - OK' })
      } catch (error) {
        return logs.add({ status: 'error', description: JSON.stringify(error) })
      }
    },
  },
})
