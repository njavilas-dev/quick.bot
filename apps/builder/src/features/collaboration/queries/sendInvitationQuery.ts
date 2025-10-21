import { CollaborationType } from '@quickbot.io/prisma'
import { sendRequest } from '@quickbot.io/lib'

export const sendInvitationQuery = (
  botId: string,
  { email, type }: { email: string; type: CollaborationType },
) =>
  sendRequest({
    method: 'POST',
    url: `/api/bots/${botId}/invitations`,
    body: { email, type },
  })
