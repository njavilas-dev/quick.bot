import { BotCollaborator } from '@quickbot.io/prisma'

export type Collaborator = BotCollaborator & {
  user: {
    name: string | null
    image: string | null
    email: string | null
  }
}
