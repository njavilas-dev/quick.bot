import { sendRequest } from '@quickbot.io/lib'

export const deleteInvitationQuery = (botId: string, email: string) =>
  sendRequest({
    method: 'DELETE',
    url: `/api/bots/${botId}/invitations/${email}`,
  })
