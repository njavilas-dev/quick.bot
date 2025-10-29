import prisma from '@quickbot.io/lib/prisma'

export const deleteSession = (id: string) =>
  prisma.chatSession.delete({
    where: {
      id,
    },
  })
