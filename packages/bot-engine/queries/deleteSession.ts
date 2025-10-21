import prisma from '@quickbot.io/lib/prisma'

export const deleteSession = (id: string) =>
  prisma.chatSession.deleteMany({
    where: {
      id,
    },
  })
