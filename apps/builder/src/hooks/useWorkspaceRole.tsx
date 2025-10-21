import { WorkspaceRole } from '@quickbot.io/prisma'
import { useWorkspace } from './useWorkspace'

/**
 * Hook to check workspace role permissions
 * @returns {Object} Object containing role checks
 */
export const useWorkspaceRole = () => {
  const { currentWorkspaceRole } = useWorkspace()

  const isAdmin = currentWorkspaceRole === WorkspaceRole.ADMIN
  const isMember = currentWorkspaceRole === WorkspaceRole.MEMBER
  const isGuest = currentWorkspaceRole === WorkspaceRole.GUEST

  return {
    currentWorkspaceRole,
    isAdmin,
    isMember,
    isGuest,
  }
}
