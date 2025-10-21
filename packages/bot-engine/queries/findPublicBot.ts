import prisma from '@quickbot.io/lib/prisma'

type Props = {
  publicId: string
}

export const findPublicBot = ({ publicId }: Props) =>
  prisma.botPublic.findFirst({
    where: { bot: { publicId } },
    select: {
      version: true,
      groups: true,
      events: true,
      edges: true,
      settings: true,
      theme: true,
      variables: true,
      botId: true,
      bot: {
        select: {
          isArchived: true,
          isClosed: true,
          workspace: {
            select: {
              id: true,
              billingPlan: true,
              isQuarantined: true,
              isSuspended: true,
            },
          },
        },
      },
      updatedAt: true,
    },
  })
