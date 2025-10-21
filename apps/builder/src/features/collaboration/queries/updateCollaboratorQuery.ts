import { BotCollaborator } from '@quickbot.io/prisma'
import { sendRequest } from '@quickbot.io/lib'

export const updateCollaboratorQuery = (
  botId: string,
  userId: string,
  collaborator: Omit<BotCollaborator, 'createdAt' | 'updatedAt'>,
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/bots/${botId}/collaborators/${userId}`,
    body: collaborator,
  })
