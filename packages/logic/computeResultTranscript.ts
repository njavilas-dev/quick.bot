import {
  Answer,
  ContinueChatResponse,
  Edge,
  Group,
  InputBlock,
  BotInSession,
  Variable,
} from '@quickbot.io/schemas'
import { SetVariableHistoryItem } from '@quickbot.io/schemas/features/result'
import { isBubbleBlock, isInputBlock } from '@quickbot.io/schemas/helpers'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { createId } from '@quickbot.io/lib/createId'
import { executeCondition } from './executeCondition'
import { parseBubbleBlock, BubbleBlockWithDefinedContent } from '../bot-engine/parseBubbleBlock'
import { defaultChoiceInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/choice/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { parseVariables } from '@quickbot.io/variables/parseVariables'

type TranscriptMessage =
  | {
      role: 'bot' | 'user'
    } & (
      | { type: 'text'; text: string }
      | { type: 'image'; image: string }
      | { type: 'video'; video: string }
      | { type: 'audio'; audio: string }
    )

export const parseTranscriptMessageText = (message: TranscriptMessage): string => {
  switch (message.type) {
    case 'text':
      return message.text
    case 'image':
      return message.image
    case 'video':
      return message.video
    case 'audio':
      return message.audio
  }
}

export const computeResultTranscript = ({
  bot,
  answers,
  setVariableHistory,
  visitedEdges,
  stopAtBlockId,
}: {
  bot: BotInSession
  answers: Pick<Answer, 'blockId' | 'content' | 'attachedFileUrls'>[]
  setVariableHistory: Pick<SetVariableHistoryItem, 'blockId' | 'variableId' | 'value'>[]
  visitedEdges: string[]
  stopAtBlockId?: string
}): TranscriptMessage[] => {
  const firstEdgeId = getFirstEdgeId(bot)
  if (!firstEdgeId) return []
  const firstEdge = bot.edges.find((edge) => edge.id === firstEdgeId)
  if (!firstEdge) return []
  const firstGroup = getNextGroup(bot, firstEdgeId)
  if (!firstGroup) return []
  return executeGroup({
    botsQueue: [{ bot: bot }],
    nextGroup: firstGroup,
    currentTranscript: [],
    answers: [...answers],
    setVariableHistory: [...setVariableHistory],
    visitedEdges,
    stopAtBlockId,
  })
}

const getFirstEdgeId = (bot: BotInSession) => {
  if (bot.version === '6') return bot.events?.[0].outgoingEdgeId
  return bot.groups.at(0)?.blocks.at(0)?.outgoingEdgeId
}

const getNextGroup = (
  bot: BotInSession,
  edgeId: string,
): { group: Group; blockIndex?: number } | undefined => {
  const edge = bot.edges.find((edge) => edge.id === edgeId)
  if (!edge) return
  const group = bot.groups.find((group) => group.id === edge.to.groupId)
  if (!group) return
  const blockIndex = edge.to.blockId
    ? group.blocks.findIndex((block) => block.id === edge.to.blockId)
    : undefined
  return { group, blockIndex }
}

const executeGroup = ({
  currentTranscript,
  botsQueue,
  answers,
  nextGroup,
  setVariableHistory,
  visitedEdges,
  stopAtBlockId,
}: {
  currentTranscript: TranscriptMessage[]
  nextGroup:
    | {
        group: Group
        blockIndex?: number | undefined
      }
    | undefined
  botsQueue: {
    bot: BotInSession
    resumeEdgeId?: string
  }[]
  answers: Pick<Answer, 'blockId' | 'content' | 'attachedFileUrls'>[]
  setVariableHistory: Pick<SetVariableHistoryItem, 'blockId' | 'variableId' | 'value'>[]
  visitedEdges: string[]
  stopAtBlockId?: string
}): TranscriptMessage[] => {
  if (!nextGroup) return currentTranscript
  for (const block of nextGroup?.group.blocks.slice(nextGroup.blockIndex ?? 0)) {
    if (stopAtBlockId && block.id === stopAtBlockId) return currentTranscript
    if (setVariableHistory.at(0)?.blockId === block.id)
      botsQueue[0].bot.variables = applySetVariable(setVariableHistory.shift(), botsQueue[0].bot)
    let nextEdgeId = block.outgoingEdgeId
    if (isBubbleBlock(block)) {
      if (!block.content) continue
      const parsedBubbleBlock = parseBubbleBlock(block as BubbleBlockWithDefinedContent, {
        version: 2,
        variables: botsQueue[0].bot.variables,
        botVersion: botsQueue[0].bot.version,
        textBubbleContentFormat: 'markdown',
      })
      const newMessage = convertChatMessageToTranscriptMessage(parsedBubbleBlock)
      if (newMessage) currentTranscript.push(newMessage)
    } else if (isInputBlock(block)) {
      const answer = answers.shift()
      if (!answer) break
      if (block.options?.variableId) {
        const replyVariable = botsQueue[0].bot.variables.find(
          (variable) => variable.id === block.options?.variableId,
        )
        if (replyVariable) {
          botsQueue[0].bot.variables = botsQueue[0].bot.variables.map((v) =>
            v.id === replyVariable.id ? { ...v, value: answer.content } : v,
          )
        }
      }
      if (
        block.type === InputBlockType.TEXT &&
        block.options?.attachments?.isEnabled &&
        block.options?.attachments?.saveVariableId &&
        answer.attachedFileUrls &&
        answer.attachedFileUrls?.length > 0
      ) {
        const variable = botsQueue[0].bot.variables.find(
          (variable) => variable.id === block.options?.attachments?.saveVariableId,
        )
        if (variable) {
          botsQueue[0].bot.variables = botsQueue[0].bot.variables.map((v) =>
            v.id === variable.id
              ? {
                  ...v,
                  value: Array.isArray(variable.value)
                    ? variable.value.concat(answer.attachedFileUrls!)
                    : answer.attachedFileUrls!.length === 1
                    ? answer.attachedFileUrls![0]
                    : answer.attachedFileUrls,
                }
              : v,
          )
        }
      }
      currentTranscript.push({
        role: 'user',
        type: 'text',
        text:
          (answer.attachedFileUrls?.length ?? 0) > 0
            ? `${answer.attachedFileUrls?.join(', ')}\n\n${answer.content}`
            : answer.content,
      })
      const outgoingEdge = getOutgoingEdgeId({
        block,
        answer: answer.content,
        variables: botsQueue[0].bot.variables,
      })
      if (outgoingEdge.isOffDefaultPath) visitedEdges.shift()
      nextEdgeId = outgoingEdge.edgeId
    } else if (block.type === LogicBlockType.CONDITION) {
      const passedCondition = block.items.find(
        (item) =>
          item.content &&
          executeCondition({
            variables: botsQueue[0].bot.variables,
            condition: item.content,
          }),
      )
      if (passedCondition) {
        visitedEdges.shift()
        nextEdgeId = passedCondition.outgoingEdgeId
      }
    } else if (block.type === LogicBlockType.AB_TEST) {
      nextEdgeId = visitedEdges.shift() ?? nextEdgeId
    } else if (block.type === LogicBlockType.JUMP) {
      if (!block.options?.groupId) continue
      const groupToJumpTo = botsQueue[0].bot.groups.find(
        (group) => group.id === block.options?.groupId,
      )
      const blockToJumpTo =
        groupToJumpTo?.blocks.find((b) => b.id === block.options?.blockId) ??
        groupToJumpTo?.blocks[0]

      if (!blockToJumpTo) continue

      const portalEdge = {
        id: createId(),
        from: { blockId: '', groupId: '' },
        to: { groupId: block.options.groupId, blockId: blockToJumpTo.id },
      }
      botsQueue[0].bot.edges.push(portalEdge)
      visitedEdges.shift()
      nextEdgeId = portalEdge.id
    } else if (block.type === LogicBlockType.BOT_LINK) {
      const isLinkingSameBot =
        block.options &&
        (block.options.botId === 'current' || block.options.botId === botsQueue[0].bot.id)

      const linkedGroup = botsQueue[0].bot.groups.find((g) => g.id === block.options?.groupId)
      if (!isLinkingSameBot || !linkedGroup) continue
      let resumeEdge: Edge | undefined
      if (!block.outgoingEdgeId) {
        const currentBlockIndex = nextGroup.group.blocks.findIndex((b) => b.id === block.id)
        const nextBlockInGroup =
          currentBlockIndex === -1 ? undefined : nextGroup.group.blocks.at(currentBlockIndex + 1)
        if (nextBlockInGroup)
          resumeEdge = {
            id: createId(),
            from: {
              blockId: '',
            },
            to: {
              groupId: nextGroup.group.id,
              blockId: nextBlockInGroup.id,
            },
          }
      }
      return executeGroup({
        botsQueue: [
          {
            bot: botsQueue[0].bot,
            resumeEdgeId: resumeEdge ? resumeEdge.id : block.outgoingEdgeId,
          },
          {
            bot: resumeEdge
              ? {
                  ...botsQueue[0].bot,
                  edges: botsQueue[0].bot.edges.concat([resumeEdge]),
                }
              : botsQueue[0].bot,
          },
        ],
        answers,
        setVariableHistory,
        currentTranscript,
        nextGroup: {
          group: linkedGroup,
        },
        visitedEdges,
        stopAtBlockId,
      })
    }
    if (nextEdgeId) {
      const nextGroup = getNextGroup(botsQueue[0].bot, nextEdgeId)
      if (nextGroup) {
        return executeGroup({
          botsQueue,
          answers,
          setVariableHistory,
          currentTranscript,
          nextGroup,
          visitedEdges,
          stopAtBlockId,
        })
      }
    }
  }
  if (botsQueue.length > 1 && botsQueue[0].resumeEdgeId) {
    return executeGroup({
      botsQueue: botsQueue.slice(1),
      answers,
      setVariableHistory,
      currentTranscript,
      nextGroup: getNextGroup(botsQueue[1].bot, botsQueue[0].resumeEdgeId),
      visitedEdges: visitedEdges.slice(1),
      stopAtBlockId,
    })
  }
  return currentTranscript
}

const applySetVariable = (
  setVariable: Pick<SetVariableHistoryItem, 'blockId' | 'variableId' | 'value'> | undefined,
  bot: BotInSession,
): Variable[] => {
  if (!setVariable) return bot.variables
  const variable = bot.variables.find((variable) => variable.id === setVariable.variableId)
  if (!variable) return bot.variables
  return bot.variables.map((v) => (v.id === variable.id ? { ...v, value: setVariable.value } : v))
}

const convertChatMessageToTranscriptMessage = (
  chatMessage: ContinueChatResponse['messages'][0],
): TranscriptMessage | null => {
  switch (chatMessage.type) {
    case BubbleBlockType.TEXT: {
      if (chatMessage.content.type === 'richText') return null
      return {
        role: 'bot',
        type: 'text',
        text: chatMessage.content.markdown,
      }
    }
    case BubbleBlockType.IMAGE: {
      if (!chatMessage.content.url) return null
      return {
        role: 'bot',
        type: 'image',
        image: chatMessage.content.url,
      }
    }
    case BubbleBlockType.VIDEO: {
      if (!chatMessage.content.url) return null
      return {
        role: 'bot',
        type: 'video',
        video: chatMessage.content.url,
      }
    }
    case BubbleBlockType.AUDIO: {
      if (!chatMessage.content.url) return null
      return {
        role: 'bot',
        type: 'audio',
        audio: chatMessage.content.url,
      }
    }
    case 'custom-embed':
    case BubbleBlockType.EMBED: {
      return null
    }
  }
}

const getOutgoingEdgeId = ({
  block,
  answer,
  variables,
}: {
  block: InputBlock
  answer: string | undefined
  variables: Variable[]
}): { edgeId: string | undefined; isOffDefaultPath: boolean } => {
  if (
    block.type === InputBlockType.CHOICE &&
    !(block.options?.isMultipleChoice ?? defaultChoiceInputOptions.isMultipleChoice) &&
    answer
  ) {
    const matchedItem = block.items.find(
      (item) => parseVariables(variables)(item.content).normalize() === answer.normalize(),
    )
    if (matchedItem?.outgoingEdgeId)
      return { edgeId: matchedItem.outgoingEdgeId, isOffDefaultPath: true }
  }
  return { edgeId: block.outgoingEdgeId, isOffDefaultPath: false }
}
