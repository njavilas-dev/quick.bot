import { createBlock } from '@quickbot.io/forge'
import { TwilioComLogo } from './logo'
import { auth } from './auth'
import { sendMessage } from './actions/sendMessage'

export const twilioComBlock = createBlock({
  id: 'twilio-com',
  name: 'Tiwilio.com',
  tags: [],
  LightLogo: TwilioComLogo,
  auth,
  actions: [sendMessage],
})
