import { WorkspaceMember } from '@quickbot.io/prisma'

export const getUserRoleInWorkspace = (
  userId: string,
  workspaceMembers: WorkspaceMember[] | undefined,
) => workspaceMembers?.find((member) => member.userId === userId)?.role
