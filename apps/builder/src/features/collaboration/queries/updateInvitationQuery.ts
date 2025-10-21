import { BotInvitation } from '@quickbot.io/prisma'
import { sendRequest } from '@quickbot.io/lib'

export const updateInvitationQuery = (
  botId: string,
  email: string,
  invitation: Omit<BotInvitation, 'createdAt' | 'id' | 'updatedAt'>,
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/bots/${botId}/invitations/${email}`,
    body: invitation,
  })
