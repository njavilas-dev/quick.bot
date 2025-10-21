import { addEdgeToBot, createPortalEdge } from '../../../addEdgeToBot'
import {
  BotLinkBlock,
  SessionState,
  Variable,
  ChatLog,
  Edge,
  botInSessionStateSchema,
  BotInSession,
} from '@quickbot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { createId } from '@quickbot.io/lib/createId'
import { isNotDefined, byId } from '@quickbot.io/lib/utils'
import { createResultIfNotExist } from '../../../queries/createResultIfNotExist'
import prisma from '@quickbot.io/lib/prisma'
import { defaultBotLinkOptions } from '@quickbot.io/schemas/features/blocks/logic/botLink/constants'

export const executeBotLink = async (
  state: SessionState,
  block: BotLinkBlock,
): Promise<ExecuteLogicResponse> => {
  const logs: ChatLog[] = []
  const botId = block.options?.botId
  if (!botId) {
    logs.push({
      status: 'error',
      description: `Failed to link bot`,
      details: `Bot ID is not specified`,
    })
    return { outgoingEdgeId: block.outgoingEdgeId, logs }
  }
  const isLinkingSameBot = botId === 'current' || botId === state.botsQueue[0].bot.id
  let newSessionState = state
  let nextGroupId: string | undefined
  if (isLinkingSameBot) {
    newSessionState = await addSameBotToState({ state, block })
    nextGroupId = block.options?.groupId
  } else {
    const linkedBot = await fetchBot(state, botId)
    if (!linkedBot) {
      logs.push({
        status: 'error',
        description: `Failed to link bot`,
        details: `Bot with ID ${block.options?.botId} not found`,
      })
      return { outgoingEdgeId: block.outgoingEdgeId, logs }
    }
    newSessionState = await addLinkedBotToState(state, block, linkedBot)
    nextGroupId = getNextGroupId(block.options?.groupId, linkedBot)
  }

  if (!nextGroupId) {
    logs.push({
      status: 'error',
      description: `Failed to link bot`,
      details: `Group with ID "${block.options?.groupId}" not found`,
    })
    return { outgoingEdgeId: block.outgoingEdgeId, logs }
  }

  const portalEdge = createPortalEdge({ to: { groupId: nextGroupId } })

  newSessionState = addEdgeToBot(newSessionState, portalEdge)

  return {
    outgoingEdgeId: portalEdge.id,
    newSessionState,
  }
}

const addSameBotToState = async ({
  state,
  block,
}: {
  state: SessionState
  block: BotLinkBlock
}) => {
  const currentBotInQueue = state.botsQueue[0]

  const resumeEdge = createResumeEdgeIfNecessary(state, block)

  const currentBotWithResumeEdge = resumeEdge
    ? {
        ...currentBotInQueue,
        bot: {
          ...currentBotInQueue.bot,
          edges: [...currentBotInQueue.bot.edges, resumeEdge],
        },
      }
    : currentBotInQueue

  return {
    ...state,
    botsQueue: [
      {
        bot: {
          ...currentBotInQueue.bot,
        },
        resultId: currentBotInQueue.resultId,
        edgeIdToTriggerWhenDone: block.outgoingEdgeId ?? resumeEdge?.id,
        answers: currentBotInQueue.answers,
        isMergingWithParent: true,
      },
      currentBotWithResumeEdge,
      ...state.botsQueue.slice(1),
    ],
  }
}

const addLinkedBotToState = async (
  state: SessionState,
  block: BotLinkBlock,
  linkedBot: BotInSession,
): Promise<SessionState> => {
  const currentBotInQueue = state.botsQueue[0]

  const resumeEdge = createResumeEdgeIfNecessary(state, block)

  const currentBotWithResumeEdge = resumeEdge
    ? {
        ...currentBotInQueue,
        bot: {
          ...currentBotInQueue.bot,
          edges: [...currentBotInQueue.bot.edges, resumeEdge],
        },
      }
    : currentBotInQueue

  const shouldMergeResults =
    currentBotInQueue.bot.version === '6'
      ? block.options?.mergeResults ?? defaultBotLinkOptions.mergeResults
      : block.options?.mergeResults !== false

  if (currentBotInQueue.resultId && currentBotInQueue.answers.length === 0) {
    await createResultIfNotExist({
      resultId: currentBotInQueue.resultId,
      bot: currentBotInQueue.bot,
      hasStarted: false,
      isCompleted: false,
    })
  }

  const isPreview = isNotDefined(currentBotInQueue.resultId)
  return {
    ...state,
    botsQueue: [
      {
        bot: {
          ...linkedBot,
          variables: fillVariablesWithExistingValues(linkedBot.variables, state.botsQueue),
        },
        resultId: isPreview
          ? undefined
          : shouldMergeResults
          ? currentBotInQueue.resultId
          : createId(),
        edgeIdToTriggerWhenDone: block.outgoingEdgeId ?? resumeEdge?.id,
        answers: shouldMergeResults ? currentBotInQueue.answers : [],
        isMergingWithParent: shouldMergeResults,
      },
      currentBotWithResumeEdge,
      ...state.botsQueue.slice(1),
    ],
  }
}

const createResumeEdgeIfNecessary = (
  state: SessionState,
  block: BotLinkBlock,
): Edge | undefined => {
  const currentBotInQueue = state.botsQueue[0]
  const blockId = block.id
  if (block.outgoingEdgeId) return
  const currentGroup = currentBotInQueue.bot.groups.find((group) =>
    group.blocks.some((block) => block.id === blockId),
  )
  if (!currentGroup) return
  const currentBlockIndex = currentGroup.blocks.findIndex((block) => block.id === blockId)
  const nextBlockInGroup =
    currentBlockIndex === -1 ? undefined : currentGroup.blocks[currentBlockIndex + 1]
  if (!nextBlockInGroup) return
  return {
    id: createId(),
    from: {
      blockId: '',
    },
    to: {
      groupId: currentGroup.id,
      blockId: nextBlockInGroup.id,
    },
  }
}

const fillVariablesWithExistingValues = (
  emptyVariables: Variable[],
  botsQueue: SessionState['botsQueue'],
): Variable[] =>
  emptyVariables.map((emptyVariable) => {
    let matchedVariable
    for (const botInQueue of botsQueue) {
      matchedVariable = botInQueue.bot.variables.find((v) => v.name === emptyVariable.name)
      if (matchedVariable) break
    }
    return {
      ...emptyVariable,
      value: matchedVariable?.value,
    }
  })

const fetchBot = async (state: SessionState, botId: string) => {
  const { resultId } = state.botsQueue[0]
  const isPreview = !resultId
  if (isPreview) {
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        version: true,
        id: true,
        edges: true,
        groups: true,
        variables: true,
        events: true,
      },
    })
    return botInSessionStateSchema.parse(bot)
  }
  const bot = await prisma.botPublic.findUnique({
    where: { botId },
    select: {
      version: true,
      id: true,
      edges: true,
      groups: true,
      variables: true,
      events: true,
    },
  })
  if (!bot) return null
  return botInSessionStateSchema.parse({
    ...bot,
    id: botId,
  })
}

const getNextGroupId = (groupId: string | undefined, bot: BotInSession) => {
  if (groupId) return groupId
  if (bot.version === '6') {
    const startEdge = bot.edges.find(byId(bot.events[0].outgoingEdgeId))
    return startEdge?.to.groupId
  }
  return bot.groups.find((group) => group.blocks.some((block) => block.type === 'start'))?.id
}
