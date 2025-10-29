import prisma from '@quickbot.io/lib/prisma'

export const removeIsReplyingInChatSession = async (id: string) =>
  prisma.chatSession.update({
    where: { id },
    data: { isReplying: false },
  })
