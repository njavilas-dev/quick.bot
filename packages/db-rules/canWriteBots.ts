import { CollaborationType, Prisma, User, WorkspaceRole } from '@quickbot.io/prisma'

export const canWriteBots = (
  botIds: string[] | string,
  user: Pick<User, 'email' | 'id'>,
): Prisma.BotWhereInput => {
  return {
    id: typeof botIds === 'string' ? botIds : { in: botIds },
    OR: [
      {
        workspace: {
          members: {
            some: { userId: user.id, role: { not: WorkspaceRole.GUEST } },
          },
        },
      },
      {
        botCollaborators: {
          some: { userId: user.id, type: { not: CollaborationType.READ } },
        },
      },
    ],
  }
}