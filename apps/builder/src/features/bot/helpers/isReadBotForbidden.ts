import { env } from '@quickbot.io/env'
import { BotCollaborator, User, Workspace, WorkspaceMember, Bot } from '@quickbot.io/prisma'
import { settingsSchema } from '@quickbot.io/schemas'

export const isReadBotForbidden = async (
  bot: {
    settings?: Bot['settings']
    botCollaborators: Pick<BotCollaborator, 'userId'>[]
  } & {
    workspace: Pick<Workspace, 'isSuspended' | 'isPastDue'> & {
      members: Pick<WorkspaceMember, 'userId'>[]
    }
  },
  user?: Pick<User, 'email' | 'id'>,
) => {
  const settings = bot.settings ? settingsSchema.parse(bot.settings) : undefined
  const isBotPublic = settings?.publicShare?.isEnabled === true
  if (isBotPublic) return false
  return (
    !user ||
    bot.workspace.isSuspended ||
    bot.workspace.isPastDue ||
    (env.ADMIN_EMAIL?.every((email) => email !== user.email) &&
      !bot.botCollaborators.some((collaborator) => collaborator.userId === user.id) &&
      !bot.workspace.members.some((member) => member.userId === user.id))
  )
}
