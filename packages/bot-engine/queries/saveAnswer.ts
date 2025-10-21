import prisma from '@quickbot.io/lib/prisma'
import { Prisma } from '@quickbot.io/prisma'
import { SessionState } from '@quickbot.io/schemas'

type Props = {
  answer: Omit<Prisma.AnswerV2CreateManyInput, 'resultId'>
  state: SessionState
}
export const saveAnswer = async ({ answer, state }: Props) => {
  const resultId = state.botsQueue[0].resultId
  if (!resultId) return
  return prisma.answerV2.createMany({
    data: [{ ...answer, resultId }],
  })
}
