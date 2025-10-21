import { WorkspaceRole } from '@quickbot.io/prisma'

export const getRoleLabel = (role?: WorkspaceRole | string): string => {
  switch (role) {
    case WorkspaceRole.ADMIN:
      return 'Admin'
    case WorkspaceRole.MEMBER:
      return 'Member'
    case WorkspaceRole.GUEST:
      return 'Guest'
    default:
      return ''
  }
}
