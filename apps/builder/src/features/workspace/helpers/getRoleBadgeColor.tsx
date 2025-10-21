import { WorkspaceRole } from "@quickbot.io/prisma"

export const getRoleBadgeColor = (role?: string) => {
  switch (role) {
    case WorkspaceRole.ADMIN:
      return 'purple'
    case WorkspaceRole.MEMBER:
      return 'blue'
    case WorkspaceRole.GUEST:
      return 'gray'
    default:
      return 'gray'
  }
}
