import {
  AnswerInSessionState,
  Block,
  ContinueChatResponse,
  Group,
  InputBlock,
  Message,
  SessionState,
  SetVariableHistoryItem,
  Variable,
} from '@quickbot.io/schemas'
import { byId, isDefined } from '@quickbot.io/lib'
import { isInputBlock } from '@quickbot.io/schemas/helpers'
import { executeGroup, parseInput } from './executeGroup'
import { getNextGroup } from './getNextGroup'
import { formatEmail } from './blocks/inputs/email/formatEmail'
import { formatPhoneNumber } from './blocks/inputs/phone/formatPhoneNumber'
import { resumeWebhookExecution } from './blocks/integrations/webhook/resumeWebhookExecution'
import { saveAnswer } from './queries/saveAnswer'
import { parseButtonsReply } from './blocks/inputs/buttons/parseButtonsReply'
import { ParsedReply, Reply } from './types'
import { validateNumber } from './blocks/inputs/number/validateNumber'
import { parseDateReply } from './blocks/inputs/date/parseDateReply'
import { validateRatingReply } from './blocks/inputs/rating/validateRatingReply'
import { parseVariables } from '@quickbot.io/variables/parseVariables'
import { getUpdatedVariablesInSession } from '@quickbot.io/variables/getUpdatedVariablesInSession'
import { getDisplayValue } from '@quickbot.io/variables/secretVariableHandler'
import { startBotFlow } from './startBotFlow'
import { TRPCError } from '@trpc/server'
import { parseNumber } from './blocks/inputs/number/parseNumber'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { defaultPaymentInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/payment/constants'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { defaultEmailInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/email/constants'
import { defaultChoiceInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/choice/constants'
import { defaultFileInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/file/constants'
import { BotResultVisitedEdge } from '@quickbot.io/prisma'
import { getBlockById } from '@quickbot.io/schemas/helpers'
import { updateConversation } from './updateConversation'
import { ForgedBlock } from '@quickbot.io/forge-repository/types'
import { forgedBlocks } from '@quickbot.io/forge-repository/definitions'
import { env } from '@quickbot.io/env'
import { isURL } from '@quickbot.io/lib/validators/isURL'
import { isForgedBlockType } from '@quickbot.io/schemas/features/blocks/forged/helpers'
import { resetSessionState } from './resetSessionState'

type Params = {
  version: 1 | 2
  state: SessionState
  startTime?: number
  textBubbleContentFormat: 'richText' | 'markdown'
}
export const continueBotFlow = async (
  reply: Reply,
  { state, version, startTime, textBubbleContentFormat }: Params,
): Promise<
  ContinueChatResponse & {
    newSessionState: SessionState
    visitedEdges: BotResultVisitedEdge[]
    setVariableHistory: SetVariableHistoryItem[]
  }
> => {
  if (!state.currentBlockId) {
    return startBotFlow({
      state: resetSessionState(state),
      version,
      textBubbleContentFormat,
    })
  }

  const { block, group, blockIndex } = validateAndGetBlock(state)
  const nonInputProcessResult = await processNonInputBlock({ block, state, reply })

  let newSessionState = nonInputProcessResult.newSessionState
  const { setVariableHistory, firstBubbleWasStreamed } = nonInputProcessResult

  const inputProcessResult = await handleInputBlock({
    block,
    reply,
    state: newSessionState,
    textBubbleContentFormat,
  })

  if (inputProcessResult.shouldReturn) {
    return inputProcessResult.result!
  }

  newSessionState = inputProcessResult.newSessionState
  const formattedReply = inputProcessResult.formattedReply
  const parsedReplyResult = inputProcessResult.parsedReplyResult
  const flowResult = await handleContinueFlow({
    block,
    group,
    blockIndex,
    newSessionState,
    formattedReply,
    reply,
    setVariableHistory,
    firstBubbleWasStreamed,
    version,
    startTime,
    textBubbleContentFormat,
    state,
    parsedReplyResult,
  })

  return flowResult
}

const processNonInputBlock = async ({
  block,
  state,
  reply,
}: {
  block: Block
  state: SessionState
  reply: Reply
}) => {
  if (reply?.type !== 'text')
    return {
      newSessionState: state,
      setVariableHistory: [],
      firstBubbleWasStreamed: false,
    }

  const setVariableHistory: SetVariableHistoryItem[] = []
  let variableToUpdate: Variable | undefined
  let newSessionState = state
  let firstBubbleWasStreamed = false

  if (block.type === LogicBlockType.SET_VARIABLE) {
    const existingVariable = state.botsQueue[0].bot.variables.find(byId(block.options?.variableId))
    if (existingVariable && reply) {
      variableToUpdate = {
        ...existingVariable,
      }
    }
  }
  else if (reply && block.type === IntegrationBlockType.WEBHOOK) {
    const result = resumeWebhookExecution({
      state,
      block,
      response: JSON.parse(reply.text),
    })
    if (result.newSessionState) newSessionState = result.newSessionState
  } else if (isForgedBlockType(block.type)) {
    if (reply) {
      const options = (block as ForgedBlock).options
      const action = forgedBlocks[block.type].actions.find((a) => a.name === options?.action)
      if (action) {
        if (action.run?.stream?.getStreamVariableId) {
          firstBubbleWasStreamed = true
          variableToUpdate = state.botsQueue[0].bot.variables.find(
            (v) => v.id === action?.run?.stream?.getStreamVariableId(options),
          )
        }

        if (action.run?.web?.displayEmbedBubble?.waitForEvent?.getSaveVariableId) {
          variableToUpdate = state.botsQueue[0].bot.variables.find(
            (v) =>
              v.id ===
              action?.run?.web?.displayEmbedBubble?.waitForEvent?.getSaveVariableId?.(options),
          )
        }
      }
    }
  } else if (
    block.type === BubbleBlockType.EMBED &&
    block.content?.waitForEvent?.saveDataInVariableId
  ) {
    variableToUpdate = state.botsQueue[0].bot.variables.find(
      (v) => v.id === block.content?.waitForEvent?.saveDataInVariableId,
    )
  }

  if (variableToUpdate) {
    const { newSetVariableHistory, updatedState } = getUpdatedVariablesInSession({
      state: newSessionState,
      currentBlockId: block.id,
      newVariables: [
        {
          ...variableToUpdate,
          value: reply?.text ? safeJsonParse(reply?.text) : undefined,
        },
      ],
    })
    newSessionState = updatedState
    setVariableHistory.push(...newSetVariableHistory)
  }

  return {
    newSessionState,
    setVariableHistory,
    firstBubbleWasStreamed,
  }
}

const processAndSaveAnswer =
  (state: SessionState, block: InputBlock) =>
    async (reply: Message | undefined): Promise<SessionState> => {
      if (!reply) return state
      return saveAnswerInDb(state, block)(reply)
    }

const saveVariablesValueIfAny =
  (state: SessionState, block: InputBlock) =>
    (reply: Message): SessionState => {
      let newSessionState = saveAttachmentsVarIfAny({ block, reply, state })
      newSessionState = saveAudioClipVarIfAny({
        block,
        reply,
        state: newSessionState,
      })
      return saveInputVarIfAny({ block, reply, state: newSessionState })
    }

const saveAttachmentsVarIfAny = ({
  block,
  reply,
  state,
}: {
  block: InputBlock
  reply: Message
  state: SessionState
}): SessionState => {
  if (
    reply.type !== 'text' ||
    block.type !== InputBlockType.TEXT ||
    !block.options?.attachments?.isEnabled ||
    !block.options?.attachments?.saveVariableId ||
    !reply.attachedFileUrls ||
    reply.attachedFileUrls.length === 0
  )
    return state

  const variable = state.botsQueue[0].bot.variables.find(
    (variable) => variable.id === block.options?.attachments?.saveVariableId,
  )

  if (!variable) return state

  const { updatedState } = getUpdatedVariablesInSession({
    newVariables: [
      {
        id: variable.id,
        name: variable.name,
        value: Array.isArray(variable.value)
          ? variable.value.concat(reply.attachedFileUrls)
          : reply.attachedFileUrls.length === 1
            ? reply.attachedFileUrls[0]
            : reply.attachedFileUrls,
      },
    ],
    currentBlockId: undefined,
    state,
  })
  return updatedState
}

const saveAudioClipVarIfAny = ({
  block,
  reply,
  state,
}: {
  block: InputBlock
  reply: Message
  state: SessionState
}): SessionState => {
  if (
    reply.type !== 'audio' ||
    block.type !== InputBlockType.TEXT ||
    !block.options?.audioClip?.isEnabled ||
    !block.options?.audioClip?.saveVariableId
  )
    return state

  const variable = state.botsQueue[0].bot.variables.find(
    (variable) => variable.id === block.options?.audioClip?.saveVariableId,
  )

  if (!variable) return state

  const { updatedState } = getUpdatedVariablesInSession({
    newVariables: [
      {
        id: variable.id,
        name: variable.name,
        value: reply.url,
      },
    ],
    currentBlockId: undefined,
    state,
  })

  return updatedState
}

function getValueFromVariableMessage(foundVariable: Variable, reply: Message) {
  if (reply.type !== 'text') {
    throw new Error('Message is not a text')
  }

  if (Array.isArray(foundVariable.value) && reply.text) {
    return foundVariable.value.concat(reply.text)
  }

  return reply.value ?? reply.text
}

const saveInputVarIfAny = ({
  block,
  reply,
  state,
}: {
  block: InputBlock
  reply: Message
  state: SessionState
}): SessionState => {
  if (reply.type !== 'text' || !block.options?.variableId) return state

  const foundVariable = state.botsQueue[0].bot.variables.find(
    (variable) => variable.id === block.options?.variableId,
  )
  if (!foundVariable) return state
  const newValue = getValueFromVariableMessage(foundVariable, reply)

  const { updatedState } = getUpdatedVariablesInSession({
    newVariables: [
      {
        ...foundVariable,
        value: newValue,
      },
    ],
    currentBlockId: undefined,
    state,
  })

  return updatedState
}

const parseRetryMessage =
  (state: SessionState) =>
    async (
      block: InputBlock,
      textBubbleContentFormat: 'richText' | 'markdown',
    ): Promise<Pick<ContinueChatResponse, 'messages' | 'input'>> => {
      const retryMessage =
        block.options && 'retryMessageContent' in block.options && block.options.retryMessageContent
          ? parseVariables(state.botsQueue[0].bot.variables)(block.options.retryMessageContent)
          : parseDefaultRetryMessage(block)
      return {
        messages: [
          {
            id: block.id,
            type: BubbleBlockType.TEXT,
            content:
              textBubbleContentFormat === 'richText'
                ? {
                  type: 'richText',
                  richText: [{ type: 'p', children: [{ text: retryMessage }] }],
                }
                : {
                  type: 'markdown',
                  markdown: retryMessage,
                },
          },
        ],
        input: await parseInput(state)(block),
      }
    }

const parseDefaultRetryMessage = (block: InputBlock): string => {
  switch (block.type) {
    case InputBlockType.EMAIL:
      return defaultEmailInputOptions.retryMessageContent
    case InputBlockType.PAYMENT:
      return defaultPaymentInputOptions.retryMessageContent
    default:
      return 'Invalid message. Please, try again.'
  }
}

const saveAnswerInDb =
  (state: SessionState, block: InputBlock) =>
    async (reply: Message): Promise<SessionState> => {
      let newSessionState = state
      const replyContent = reply.type === 'audio' ? reply.url : reply.text
      const attachedFileUrls = reply.type === 'text' ? reply.attachedFileUrls : undefined

      // Mask answer content if associated with a secret variable
      const variable = block.options?.variableId
        ? state.botsQueue[0].bot.variables.find((v) => v.id === block.options?.variableId)
        : undefined
      const contentToSave = getDisplayValue(replyContent, variable)

      await saveAnswer({
        answer: {
          blockId: block.id,
          content: contentToSave,
          attachedFileUrls,
        },
        state,
      })

      newSessionState = {
        ...saveVariablesValueIfAny(newSessionState, block)(reply),
        previewMetadata: state.botsQueue[0].resultId
          ? newSessionState.previewMetadata
          : {
            ...newSessionState.previewMetadata,
            answers: (newSessionState.previewMetadata?.answers ?? []).concat({
              blockId: block.id,
              content: contentToSave,
              attachedFileUrls,
            }),
          },
      }

      // Update conversation with user response
      const userMessage =
        (attachedFileUrls ?? []).length > 0
          ? `${attachedFileUrls!.join(', ')}\n\n${contentToSave}`
          : contentToSave
      newSessionState = {
        ...newSessionState,
        botsQueue: newSessionState.botsQueue.map((bot, index) =>
          index === 0
            ? {
              ...bot,
              bot: {
                ...bot.bot,
                variables: updateConversation(bot.bot.variables, 'user', userMessage),
              },
            }
            : bot,
        ),
      }

      const key = block.options?.variableId
        ? newSessionState.botsQueue[0].bot.variables.find(
          (variable) => variable.id === block.options?.variableId,
        )?.name
        : parseGroupKey(block.id, { state: newSessionState })

      return setNewAnswerInState(newSessionState)({
        key: key ?? block.id,
        value: userMessage,
      })
    }

const parseGroupKey = (blockId: string, { state }: { state: SessionState }) => {
  const group = state.botsQueue[0].bot.groups.find((group) =>
    group.blocks.find((b) => b.id === blockId),
  )
  if (!group) return

  const inputBlockNumber = group.blocks.filter(isInputBlock).findIndex((b) => b.id === blockId)

  return inputBlockNumber > 0 ? `${group.title} (${inputBlockNumber})` : group?.title
}

const setNewAnswerInState = (state: SessionState) => (newAnswer: AnswerInSessionState) => {
  const answers = state.botsQueue[0].answers
  const newAnswers = answers.filter((answer) => answer.key !== newAnswer.key).concat(newAnswer)

  return {
    ...state,
    progressMetadata: state.progressMetadata
      ? { totalAnswers: state.progressMetadata.totalAnswers + 1 }
      : undefined,
    botsQueue: state.botsQueue.map((bot, index) =>
      index === 0
        ? {
          ...bot,
          answers: newAnswers,
        }
        : bot,
    ),
  } satisfies SessionState
}

const getOutgoingEdgeId =
  (state: Pick<SessionState, 'botsQueue'>) =>
    (
      block: Block,
      reply: string | undefined,
      useDefault?: boolean,
    ): { edgeId: string | undefined; isOffDefaultPath: boolean } => {
      const variables = state.botsQueue[0].bot.variables
      if (
        block.type === InputBlockType.CHOICE &&
        !(block.options?.isMultipleChoice ?? defaultChoiceInputOptions.isMultipleChoice) &&
        reply &&
        !useDefault
      ) {
        const matchedItem = block.items.find(
          (item) => parseVariables(variables)(item.content).normalize() === reply.normalize(),
        )
        if (matchedItem?.outgoingEdgeId)
          return { edgeId: matchedItem.outgoingEdgeId, isOffDefaultPath: true }
      }
      return { edgeId: block.outgoingEdgeId, isOffDefaultPath: false }
    }

const parseReply =
  (state: SessionState) =>
    async (reply: Reply, block: InputBlock): Promise<ParsedReply> => {
      switch (block.type) {
        case InputBlockType.EMAIL: {
          if (!reply || reply.type !== 'text') return { status: 'fail' }
          const formattedEmail = formatEmail(reply.text)
          if (!formattedEmail) return { status: 'fail' }
          return { status: 'success', reply: formattedEmail }
        }
        case InputBlockType.PHONE: {
          if (!reply || reply.type !== 'text') return { status: 'fail' }
          const formattedPhone = formatPhoneNumber(reply.text, block.options?.defaultCountryCode)
          if (!formattedPhone) return { status: 'fail' }
          return { status: 'success', reply: formattedPhone }
        }
        case InputBlockType.URL: {
          if (!reply || reply.type !== 'text') return { status: 'fail' }
          const isValid = isURL(reply.text, { require_protocol: false })
          if (!isValid) return { status: 'fail' }
          return { status: 'success', reply: reply.text }
        }
        case InputBlockType.CHOICE: {
          if (!reply || reply.type !== 'text') return { status: 'fail' }
          return parseButtonsReply(state)(reply.text, block)
        }
        case InputBlockType.NUMBER: {
          if (!reply || reply.type !== 'text') return { status: 'fail' }
          const isValid = validateNumber(reply.text, {
            options: block.options,
            variables: state.botsQueue[0].bot.variables,
          })
          if (!isValid) return { status: 'fail' }
          return { status: 'success', reply: parseNumber(reply.text) }
        }
        case InputBlockType.DATE: {
          if (!reply || reply.type !== 'text') return { status: 'fail' }
          return parseDateReply(reply.text, block)
        }
        case InputBlockType.FILE: {
          if (!reply)
            return block.options?.isRequired ?? defaultFileInputOptions.isRequired
              ? { status: 'fail' }
              : { status: 'skip' }
          const replyValue = reply.type === 'audio' ? reply.url : reply.text
          const urls = replyValue.split(', ')
          const status = urls.some((url) =>
            isURL(url, { require_tld: env.S3_ENDPOINT !== 'localhost' }),
          )
            ? 'success'
            : 'fail'
          if (!block.options?.isMultipleAllowed && urls.length > 1)
            return { status, reply: replyValue.split(',')[0] }
          return { status, reply: replyValue }
        }
        case InputBlockType.PAYMENT: {
          if (!reply || reply.type !== 'text') return { status: 'fail' }
          if (reply.text === 'fail') return { status: 'fail' }
          return { status: 'success', reply: reply.text }
        }
        case InputBlockType.RATING: {
          if (!reply || reply.type !== 'text') return { status: 'fail' }
          const isValid = validateRatingReply(reply.text, block)
          if (!isValid) return { status: 'fail' }
          return { status: 'success', reply: reply.text }
        }
        case InputBlockType.TEXT: {
          if (!reply) return { status: 'fail' }
          return {
            status: 'success',
            reply: reply.type === 'audio' ? reply.url : reply.text,
          }
        }
      }
    }

const validateAndGetBlock = (state: SessionState) => {
  const { block, group, blockIndex } = getBlockById(
    state.currentBlockId!,
    state.botsQueue[0].bot.groups,
  )

  if (!block) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Group / block not found',
    })
  }

  return { block, group, blockIndex }
}

const handleInputBlock = async ({
  block,
  reply,
  state,
  textBubbleContentFormat,
}: {
  block: Block
  reply: Reply
  state: SessionState
  textBubbleContentFormat: 'richText' | 'markdown'
}) => {
  let newSessionState = state
  let formattedReply: string | undefined
  let parsedReplyResult: ParsedReply | undefined

  if (isInputBlock(block)) {
    parsedReplyResult = await parseReply(newSessionState)(reply, block)

    if (parsedReplyResult.status === 'fail') {
      return {
        shouldReturn: true,
        result: {
          ...(await parseRetryMessage(newSessionState)(block, textBubbleContentFormat)),
          newSessionState,
          visitedEdges: [],
          setVariableHistory: [],
        },
        newSessionState,
        formattedReply,
        parsedReplyResult,
      }
    }

    formattedReply = extractFormattedReply(parsedReplyResult, reply)
    const processedReply = createProcessedReply(reply, formattedReply, parsedReplyResult)
    newSessionState = await processAndSaveAnswer(state, block)(processedReply)

    // // Hide value if variable is secret - mask with same length as original value
    // if (block.options?.variableId && reply?.type === 'text') {
    //   const variable = state.botsQueue[0].bot.variables.find(
    //     (v) => v.id === block.options?.variableId,
    //   )
    //   if (variable?.isSecretVariable) {
    //     formattedReply = getDisplayValue(reply.text, variable)
    //   }
    // }
  }

  return {
    shouldReturn: false,
    result: undefined,
    newSessionState,
    formattedReply,
    parsedReplyResult,
  }
}

const extractFormattedReply = (parsedReplyResult: ParsedReply, reply: Reply) => {
  return 'reply' in parsedReplyResult && reply?.type === 'text'
    ? parsedReplyResult.reply
    : undefined
}

const createProcessedReply = (
  reply: Reply,
  formattedReply: string | undefined,
  parsedReplyResult: ParsedReply,
) => {
  return isDefined(formattedReply)
    ? {
      ...reply,
      type: 'text' as const,
      text: formattedReply,
      ...('value' in parsedReplyResult && { value: parsedReplyResult.value }),
    }
    : reply
}

const handleContinueFlow = async ({
  block,
  group,
  blockIndex,
  newSessionState,
  formattedReply,
  reply,
  setVariableHistory,
  firstBubbleWasStreamed,
  version,
  startTime,
  textBubbleContentFormat,
  state,
  parsedReplyResult,
}: {
  block: Block
  group: Group
  blockIndex: number
  newSessionState: SessionState
  formattedReply: string | undefined
  reply: Reply
  setVariableHistory: SetVariableHistoryItem[]
  firstBubbleWasStreamed: boolean
  version: 1 | 2
  startTime?: number
  textBubbleContentFormat: 'richText' | 'markdown'
  state: SessionState
  parsedReplyResult?: ParsedReply
}) => {
  const groupHasMoreBlocks = blockIndex < group.blocks.length - 1
  const useDefault =
    parsedReplyResult?.status === 'success' &&
    'useDefault' in parsedReplyResult &&
    parsedReplyResult.useDefault
  const { edgeId: nextEdgeId, isOffDefaultPath } = getOutgoingEdgeId(newSessionState)(
    block,
    formattedReply,
    useDefault,
  )
  const lastMessageNewFormat = getLastMessageNewFormat(reply, formattedReply)

  if (groupHasMoreBlocks && !nextEdgeId) {
    return handleContinueCurrentGroup({
      group,
      blockIndex,
      newSessionState,
      setVariableHistory,
      firstBubbleWasStreamed,
      version,
      startTime,
      textBubbleContentFormat,
      lastMessageNewFormat,
    })
  }

  if (!nextEdgeId && state.botsQueue.length === 1) {
    return createEndFlowResponse(newSessionState, lastMessageNewFormat, setVariableHistory)
  }

  return handleNextGroup({
    newSessionState,
    nextEdgeId,
    isOffDefaultPath,
    lastMessageNewFormat,
    setVariableHistory,
    firstBubbleWasStreamed,
    version,
    startTime,
    textBubbleContentFormat,
  })
}

const getLastMessageNewFormat = (reply: Reply, formattedReply: string | undefined) => {
  return reply?.type === 'text' && formattedReply !== reply?.text ? formattedReply : undefined
}

const handleContinueCurrentGroup = async ({
  group,
  blockIndex,
  newSessionState,
  setVariableHistory,
  firstBubbleWasStreamed,
  version,
  startTime,
  textBubbleContentFormat,
  lastMessageNewFormat,
}: {
  group: Group
  blockIndex: number
  newSessionState: SessionState
  setVariableHistory: SetVariableHistoryItem[]
  firstBubbleWasStreamed: boolean
  version: 1 | 2
  startTime?: number
  textBubbleContentFormat: 'richText' | 'markdown'
  lastMessageNewFormat: string | undefined
}) => {
  const chatReply = await executeGroup(
    {
      ...group,
      blocks: group.blocks.slice(blockIndex + 1),
    } as Group,
    {
      version,
      state: newSessionState,
      visitedEdges: [],
      setVariableHistory,
      firstBubbleWasStreamed,
      startTime,
      textBubbleContentFormat,
    },
  )
  return {
    ...chatReply,
    lastMessageNewFormat,
  }
}

const createEndFlowResponse = (
  newSessionState: SessionState,
  lastMessageNewFormat: string | undefined,
  setVariableHistory: SetVariableHistoryItem[],
) => {
  return {
    messages: [],
    newSessionState,
    lastMessageNewFormat,
    visitedEdges: [],
    setVariableHistory,
  }
}

const handleNextGroup = async ({
  newSessionState,
  nextEdgeId,
  isOffDefaultPath,
  lastMessageNewFormat,
  setVariableHistory,
  firstBubbleWasStreamed,
  version,
  startTime,
  textBubbleContentFormat,
}: {
  newSessionState: SessionState
  nextEdgeId: string | undefined
  isOffDefaultPath: boolean
  lastMessageNewFormat: string | undefined
  setVariableHistory: SetVariableHistoryItem[]
  firstBubbleWasStreamed: boolean
  version: 1 | 2
  startTime?: number
  textBubbleContentFormat: 'richText' | 'markdown'
}) => {
  const nextGroup = await getNextGroup({
    state: newSessionState,
    edgeId: nextEdgeId,
    isOffDefaultPath,
  })

  const updatedSessionState = nextGroup.newSessionState

  if (!nextGroup.group) {
    return {
      messages: [],
      newSessionState: updatedSessionState,
      lastMessageNewFormat,
      visitedEdges: nextGroup.visitedEdge ? [nextGroup.visitedEdge] : [],
      setVariableHistory,
    }
  }

  const chatReply = await executeGroup(nextGroup.group, {
    version,
    state: updatedSessionState,
    firstBubbleWasStreamed,
    visitedEdges: nextGroup.visitedEdge ? [nextGroup.visitedEdge] : [],
    setVariableHistory,
    startTime,
    textBubbleContentFormat,
  })

  return {
    ...chatReply,
    lastMessageNewFormat,
  }
}

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
