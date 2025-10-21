import {
  CollaborationType,
  BotCollaborator,
  WorkspaceMember,
  User,
  Workspace,
} from '@quickbot.io/prisma'

export const isWriteBotForbidden = async (
  bot: {
    botCollaborators: Pick<BotCollaborator, 'userId' | 'type'>[]
  } & {
    workspace: Pick<Workspace, 'isSuspended' | 'isPastDue'> & {
      members: Pick<WorkspaceMember, 'userId' | 'role'>[]
    }
  },
  user: Pick<User, 'id'>,
) => {
  return (
    bot.workspace.isSuspended ||
    bot.workspace.isPastDue ||
    (!bot.botCollaborators.some(
      (collaborator) =>
        collaborator.userId === user.id && collaborator.type === CollaborationType.WRITE,
    ) &&
      !bot.workspace.members.some((m) => m.userId === user.id && m.role !== 'GUEST'))
  )
}
