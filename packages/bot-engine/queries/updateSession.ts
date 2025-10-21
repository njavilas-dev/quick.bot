import prisma from '@quickbot.io/lib/prisma'
import { Prisma } from '@quickbot.io/prisma'
import { SessionState } from '@quickbot.io/schemas'

type Props = {
  id: string
  state: SessionState
  isReplying: boolean | undefined
  lastWhatsAppMessageId?: string
}

export const updateSession = ({ id, state, isReplying, lastWhatsAppMessageId }: Props): Prisma.PrismaPromise<any> =>
  prisma.chatSession.updateMany({
    where: { id },
    data: {
      state,
      isReplying,
      ...(lastWhatsAppMessageId ? { lastWhatsAppMessageId } : {}),
    },
  })
