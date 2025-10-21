import { WorkspaceMember, User } from '@quickbot.io/prisma'

export const isWriteWorkspaceForbidden = (
  workspace: {
    members: Pick<WorkspaceMember, 'userId' | 'role'>[]
  },
  user: Pick<User, 'id'>,
) => {
  const userRole = workspace.members.find((member) => member.userId === user.id)?.role
  return !userRole || userRole === 'GUEST'
}
