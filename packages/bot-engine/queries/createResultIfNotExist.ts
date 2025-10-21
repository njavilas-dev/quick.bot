import prisma from '@quickbot.io/lib/prisma'
import { BotInSession } from '@quickbot.io/schemas'

type Props = {
  resultId: string
  bot: BotInSession
  hasStarted: boolean
  isCompleted: boolean
}

export const createResultIfNotExist = async ({ resultId, bot, hasStarted, isCompleted }: Props) => {
  const existingResult = await prisma.botResult.findUnique({
    where: { id: resultId },
    select: { id: true },
  })
  if (existingResult) return
  return prisma.botResult.createMany({
    data: [
      {
        id: resultId,
        botId: bot.id,
        isCompleted: isCompleted ? true : false,
        hasStarted,
        variables: bot.variables,
      },
    ],
  })
}
