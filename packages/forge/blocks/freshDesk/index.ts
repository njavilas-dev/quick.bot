import { createBlock } from '@quickbot.io/forge'
import { auth } from './auth'
import { createTicket, getTicketTypes } from './actions'
import { FreshDeskLogo } from './logo'

export const freshDeskBlock = createBlock({
  id: 'freshdesk',
  name: 'FreshDesk',
  tags: ['support', 'tickets', 'helpdesk', 'freshdesk'],
  LightLogo: FreshDeskLogo,
  auth,
  actions: [createTicket, getTicketTypes],
  docsUrl: 'https://docs.quick.bot/builder/editor/blocks/integrations/freshdesk',
})
