import { User } from '@quickbot.io/prisma'
import { env } from '@quickbot.io/env'

export const canReadBots = (botIds: string | string[], user: Pick<User, 'email' | 'id'>) => ({
  id: typeof botIds === 'string' ? botIds : { in: botIds },
  workspace:
    env.ADMIN_EMAIL?.some((email) => email === user.email)
      ? undefined
      : {
        members: {
          some: { userId: user.id },
        },
      },
})