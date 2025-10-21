import { WorkspaceInvitation } from '@quickbot.io/prisma'
import { sendRequest } from '@quickbot.io/lib'

export const updateInvitationQuery = (invitation: Partial<WorkspaceInvitation>) =>
  sendRequest({
    url: `/api/workspaces/${invitation.workspaceId}/invitations/${invitation.id}`,
    method: 'PATCH',
    body: invitation,
  })
