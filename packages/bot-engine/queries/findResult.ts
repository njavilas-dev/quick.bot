import prisma from '@quickbot.io/lib/prisma'
import { Answer, Result } from '@quickbot.io/schemas'

type Props = {
  id: string
}
export const findResult = async ({ id }: Props) => {
  const { answersV2, ...result } =
    (await prisma.botResult.findFirst({
      where: { id, isArchived: { not: true } },
      select: {
        id: true,
        variables: true,
        hasStarted: true,
        answersV2: {
          select: {
            content: true,
            blockId: true,
          },
        },
      },
    })) ?? {}
  if (!result) return null
  return {
    ...result,
    answers: answersV2 ?? [],
  } as Pick<Result, 'id' | 'variables' | 'hasStarted'> & {
    answers: Pick<Answer, 'content' | 'blockId'>[]
  }
}
