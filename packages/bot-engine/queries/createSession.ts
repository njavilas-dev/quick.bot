import prisma from '@quickbot.io/lib/prisma'
import { Prisma } from '@quickbot.io/prisma'
import { SessionState } from '@quickbot.io/schemas'

type Props = {
  id?: string
  state: SessionState
  isReplying?: boolean
}

export const createSession = ({ id, state, isReplying }: Props): Prisma.PrismaPromise<any> => {
  if (!id) {
    return prisma.chatSession.create({
      data: {
        id,
        state,
        isReplying,
      },
    })
  }
  return prisma.chatSession.upsert({
    where: { id },
    update: {
      state,
      isReplying,
    },
    create: {
      id,
      state,
      isReplying,
    },
  })
}
