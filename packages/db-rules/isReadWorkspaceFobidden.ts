import { env } from '@quickbot.io/env'
import { WorkspaceMember, User } from '@quickbot.io/prisma'

export const isReadWorkspaceFobidden = (
  workspace: {
    members: Pick<WorkspaceMember, 'userId'>[]
  },
  user: Pick<User, 'email' | 'id'>,
) => {
  if (
    env.ADMIN_EMAIL?.some((email) => email === user.email) ||
    workspace.members.find((member) => member.userId === user.id)
  )
    return false
  return true
}
