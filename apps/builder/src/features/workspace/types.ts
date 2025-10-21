import { WorkspaceMember } from '@quickbot.io/prisma'

export type Member = WorkspaceMember & {
  name: string | null
  image: string | null
  email: string | null
}
