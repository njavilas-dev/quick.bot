import prisma from '@quickbot.io/lib/prisma'

type Props = {
  existingSessionId: string | undefined
  newSessionId: string
}
export const setIsReplyingInChatSession = async ({ existingSessionId, newSessionId }: Props) => {
  if (existingSessionId) {
    return prisma.chatSession.update({
      where: { id: existingSessionId },
      data: { isReplying: true },
    })
  }
  return prisma.chatSession.create({
    data: { id: newSessionId, isReplying: true, state: {} },
  })
}
