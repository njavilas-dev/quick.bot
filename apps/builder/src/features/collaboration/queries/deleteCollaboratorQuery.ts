import { sendRequest } from '@quickbot.io/lib'

export const deleteCollaboratorQuery = (botId: string, userId: string) =>
  sendRequest({
    method: 'DELETE',
    url: `/api/bots/${botId}/collaborators/${userId}`,
  })
