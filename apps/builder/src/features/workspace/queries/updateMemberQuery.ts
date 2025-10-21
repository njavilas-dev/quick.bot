import { WorkspaceMember } from '@quickbot.io/prisma'
import { sendRequest } from '@quickbot.io/lib'

export const updateMemberQuery = (workspaceId: string, member: Partial<WorkspaceMember>) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/workspaces/${workspaceId}/members/${member.userId}`,
    body: member,
  })
