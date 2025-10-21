import { TRPCError } from '@trpc/server'
import prisma from '@quickbot.io/lib/prisma'
import { SessionState, Variable, PublicBot, Bot } from '@quickbot.io/schemas'
import { getSession } from '../queries/getSession'

type Props = {
  user?: { id: string }
  sessionId: string
}

export const updateBotInSession = async ({ user, sessionId }: Props) => {
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' })
  const session = await getSession(sessionId)
  if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' })

  const publicBot = (await prisma.botPublic.findFirst({
    where: {
      bot: {
        id: session.state.botsQueue[0].bot.id,
        OR: [
          {
            workspace: {
              members: {
                some: { userId: user.id, role: { in: ['ADMIN', 'MEMBER'] } },
              },
            },
          },
          {
            botCollaborators: {
              some: { userId: user.id, type: { in: ['WRITE'] } },
            },
          },
        ],
      },
    },
    select: {
      edges: true,
      groups: true,
      variables: true,
    },
  })) as Pick<PublicBot, 'edges' | 'variables' | 'groups'> | null

  if (!publicBot) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' })

  const newSessionState = updateSessionState(session.state, publicBot)

  await prisma.chatSession.updateMany({
    where: { id: session.id },
    data: { state: newSessionState },
  })

  return { message: 'success' } as const
}

const updateSessionState = (
  currentState: SessionState,
  newBot: Pick<PublicBot, 'edges' | 'variables' | 'groups'>,
): SessionState => ({
  ...currentState,
  botsQueue: currentState.botsQueue.map((botInQueue, index) =>
    index === 0
      ? {
          ...botInQueue,
          bot: {
            ...botInQueue.bot,
            edges: newBot.edges,
            groups: newBot.groups,
            variables: updateVariablesInSession(botInQueue.bot.variables, newBot.variables),
          },
        }
      : botInQueue,
  ) as SessionState['botsQueue'],
})

const updateVariablesInSession = (
  currentVariables: Variable[],
  newVariables: Bot['variables'],
): Variable[] => [
  ...currentVariables,
  ...newVariables.filter(
    (newVariable) =>
      !currentVariables.find((currentVariable) => currentVariable.id === newVariable.id),
  ),
]
