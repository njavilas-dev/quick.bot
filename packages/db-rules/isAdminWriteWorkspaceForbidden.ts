import { WorkspaceMember, User } from '@quickbot.io/prisma'

export const isAdminWriteWorkspaceForbidden = (
  workspace: {
    members: Pick<WorkspaceMember, 'role' | 'userId'>[]
  },
  user: Pick<User, 'email' | 'id'>,
) => {
  const userRole = workspace.members.find((member) => member.userId === user.id)?.role
  return !userRole || userRole !== 'ADMIN'
}
