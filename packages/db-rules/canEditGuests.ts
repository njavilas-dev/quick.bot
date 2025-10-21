import { User, WorkspaceRole } from '@quickbot.io/prisma'

export const canEditGuests = (user: User, botId: string) => ({
  id: botId,
  workspace: {
    members: {
      some: { userId: user.id, role: { not: WorkspaceRole.GUEST } },
    },
  },
})