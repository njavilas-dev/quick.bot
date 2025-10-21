import prisma from '@quickbot.io/lib/prisma'

type Props = {
  isPreview?: boolean
  botIds: string[]
  userId: string | undefined
}

export const fetchLinkedBots = async ({ userId, isPreview, botIds }: Props) => {
  if (!userId || !isPreview)
    return prisma.botPublic.findMany({
      where: { botId: { in: botIds } },
    })
  const linkedBots = await prisma.bot.findMany({
    where: { id: { in: botIds } },
    include: {
      botCollaborators: {
        select: {
          userId: true,
        },
      },
      workspace: {
        select: {
          members: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  })

  return linkedBots.filter(
    (bot) =>
      bot.botCollaborators.some((collaborator) => collaborator.userId === userId) ||
      bot.workspace.members.some((member) => member.userId === userId),
  )
}
