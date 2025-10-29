import {
  createContext,
  useContext,
  createSignal,
  onCleanup,
  Accessor,
  JSX,
  createEffect,
} from 'solid-js'
import {
  ContinueChatResponse,
  InputBlock,
  Theme,
  ChatLog,
  StartChatResponse,
} from '@quickbot.io/schemas'
import { BotContext, ChatChunk as ChatChunkType, InputSubmitContent, OutgoingLog } from '@/types'
import { getAnswerContent } from '@/utils/getAnswerContent'
import { saveClientLogsQuery } from '@/queries/saveClientLogsQuery'
import { continueChatQuery } from '@/queries/continueChatQuery'
import { formattedMessages, setFormattedMessages } from '@/utils/formattedMessagesSignal'
import { HTTPError } from 'ky'
import { convertSubmitContentToMessage, parseDynamicTheme } from './ConversationContainer/helpers'
import { persist } from '@/utils/persist'
import { isNotDefined } from '@quickbot.io/lib'
import { executeClientSideAction } from '@/utils/executeClientSideActions'
import { setStreamingMessage } from '@/utils/streamingMessageSignal'

type InputAnswerContextType = {
  chatChunks: Accessor<ChatChunkType[]>
  theme: Accessor<Theme>
  dynamicTheme: Accessor<ContinueChatResponse['dynamicTheme']>
  setTheme: (theme: Theme) => void
  hasError: Accessor<boolean>
  setHasError: (hasError: boolean) => void
  isSending: Accessor<boolean>
  blockedPopupUrl: Accessor<string | undefined>
  setBlockedPopupUrl: (url: string | undefined) => void
  blockRef: HTMLDivElement | undefined
  currentBlock: () => ChatChunkType | undefined
  answers: Accessor<Record<number, InputSubmitContent | undefined>>
  setAnswer: (chunkIndex: number, content: InputSubmitContent | undefined) => void
  getAnswer: (chunkIndex: number) => InputSubmitContent | undefined
  displayedMessageIndexes: Accessor<Record<number, number>>
  setDisplayedMessageIndex: (chunkIndex: number, index: number) => void
  getDisplayedMessageIndex: (chunkIndex: number) => number
  sendMessage: (answer?: InputSubmitContent) => Promise<void>
  processClientSideActions: (
    actions: NonNullable<ContinueChatResponse['clientSideActions']>,
  ) => Promise<void>
}

type Props = {
  children: JSX.Element
  initialChatReply: StartChatResponse
  context: BotContext
  onNewInputBlock?: (inputBlock: InputBlock) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
  onProgressUpdate?: (progress: number) => void
}

const InputAnswerContext = createContext<InputAnswerContextType>()

export const InputAnswerProvider = (props: Props) => {
  const [answers, setAnswers] = createSignal<Record<number, InputSubmitContent | undefined>>({})
  const [theme, setTheme] = createSignal<Theme>(props.initialChatReply.bot.theme)
  const [hasError, setHasError] = createSignal(false)
  const [isSending, setIsSending] = createSignal(false)
  const [blockedPopupUrl, setBlockedPopupUrl] = createSignal<string>()
  const [dynamicTheme, setDynamicTheme] = createSignal<ContinueChatResponse['dynamicTheme']>(
    props.initialChatReply.dynamicTheme,
  )

  let blockRef: HTMLDivElement | undefined

  const [chatChunks, setChatChunks, isRecovered, setIsRecovered] = persist(
    createSignal<ChatChunkType[]>([
      {
        input: props.initialChatReply.input,
        messages: props.initialChatReply.messages,
        clientSideActions: props.initialChatReply.clientSideActions,
      },
    ]),
    {
      key: `bot-${props.context.bot.id}-chatChunks`,
      storage: props.context.storage,
      onRecovered: () => {
        // Note: scroll to bottom will be handled by individual components
      },
    },
  )
  const setAnswer = (chunkIndex: number, content: InputSubmitContent | undefined) => {
    setAnswers((prev) => ({
      ...prev,
      [chunkIndex]: content,
    }))
  }

  const getAnswer = (chunkIndex: number) => {
    return answers()[chunkIndex]
  }

  const [displayedMessageIndexes, setDisplayedMessageIndexes] = createSignal<
    Record<number, number>
  >({})

  const setDisplayedMessageIndex = (chunkIndex: number, index: number) => {
    setDisplayedMessageIndexes((prev) => ({
      ...prev,
      [chunkIndex]: index,
    }))
  }

  const getDisplayedMessageIndex = (chunkIndex: number) => {
    return displayedMessageIndexes()[chunkIndex] ?? 0
  }

  const currentBlock = () => [...chatChunks()].pop()

  const sendMessage = async (answer?: InputSubmitContent) => {
    setIsRecovered(false)
    setHasError(false)
    const currentInputBlock = currentBlock()?.input

    // Save answer in the last chunk before sending to server
    if (answer) {
      setChatChunks((displayedChunks) => {
        const lastChunkIndex = displayedChunks.length - 1
        if (lastChunkIndex < 0) return displayedChunks

        const lastChunk = displayedChunks[lastChunkIndex]
        if (!lastChunk.input) return displayedChunks

        return [
          ...displayedChunks.slice(0, lastChunkIndex),
          {
            ...lastChunk,
            input: { ...lastChunk.input, answer },
          },
        ]
      })
    }

    if (currentInputBlock?.id && props.onAnswer && answer)
      props.onAnswer({
        message: getAnswerContent(answer),
        blockId: currentInputBlock.id,
      })
    const longRequest = setTimeout(() => {
      setIsSending(true)
    }, 1000)
    // autoScrollToBottom will be handled by the component with the actual container ref
    const { data, error } = await continueChatQuery({
      apiHost: props.context.apiHost,
      sessionId: props.initialChatReply.sessionId,
      message: convertSubmitContentToMessage(answer),
    })
    clearTimeout(longRequest)
    setIsSending(false)
    if (error) {
      setHasError(true)
      const errorLogs = [
        {
          description: 'Failed to send the reply',
          details:
            error instanceof HTTPError
              ? {
                  status: error.response.status,
                  body: await error.response.json(),
                }
              : error,
          status: 'error',
        },
      ]
      await saveClientLogsQuery({
        apiHost: props.context.apiHost,
        sessionId: props.initialChatReply.sessionId,
        clientLogs: errorLogs,
      })
      props.onNewLogs?.(errorLogs)
      return
    }
    if (!data) return
    if (data.progress) props.onProgressUpdate?.(data.progress)
    if (data.lastMessageNewFormat) {
      setFormattedMessages([
        ...formattedMessages(),
        {
          inputIndex: [...chatChunks()].length - 1,
          formattedMessage: data.lastMessageNewFormat as string,
        },
      ])
      // Update answer with formatted message in the chunk
      setChatChunks((displayedChunks) => {
        const lastChunkIndex = displayedChunks.length - 1
        if (lastChunkIndex < 0) return displayedChunks

        const lastChunk = displayedChunks[lastChunkIndex]
        if (!lastChunk.input?.answer || lastChunk.input.answer.type !== 'text')
          return displayedChunks

        return [
          ...displayedChunks.slice(0, lastChunkIndex),
          {
            ...lastChunk,
            input: {
              ...lastChunk.input,
              answer: {
                ...lastChunk.input.answer,
                label: data.lastMessageNewFormat as string,
              },
            },
          },
        ]
      })
    }
    if (data.logs) props.onNewLogs?.(data.logs)
    if (data.dynamicTheme) setDynamicTheme(data.dynamicTheme)
    if (data.input && props.onNewInputBlock) {
      props.onNewInputBlock(data.input)
    }
    if (data.clientSideActions) {
      const actionsBeforeFirstBubble = data.clientSideActions.filter((action) =>
        isNotDefined(action.lastBubbleBlockId),
      )
      await processClientSideActions(actionsBeforeFirstBubble)
      if (
        data.clientSideActions.length === 1 &&
        data.clientSideActions[0].type === 'stream' &&
        data.messages.length === 0 &&
        data.input === undefined
      )
        return
    }
    setChatChunks((displayedChunks) => [
      ...displayedChunks,
      {
        input: data.input,
        messages: data.messages,
        clientSideActions: data.clientSideActions,
      },
    ])
  }

  const streamMessage = ({ id, message }: { id: string; message: string }) => {
    setIsSending(false)
    const lastChunk = [...chatChunks()].pop()
    if (!lastChunk) return
    if (lastChunk.streamingMessageId !== id)
      setChatChunks((displayedChunks) => [
        ...displayedChunks,
        {
          messages: [],
          streamingMessageId: id,
        },
      ])
    setStreamingMessage({ id, content: message })
  }

  const saveLogs = async (clientLogs?: ChatLog[]) => {
    if (!clientLogs) return
    props.onNewLogs?.(clientLogs)
    if (props.context.isPreview) return
    await saveClientLogsQuery({
      apiHost: props.context.apiHost,
      sessionId: props.initialChatReply.sessionId,
      clientLogs,
    })
  }

  const processClientSideActions = async (
    actions: NonNullable<ContinueChatResponse['clientSideActions']>,
  ) => {
    if (isRecovered()) return
    for (const action of actions) {
      if (
        'streamOpenAiChatCompletion' in action ||
        'webhookToExecute' in action ||
        'stream' in action
      )
        setIsSending(true)
      const response = await executeClientSideAction({
        clientSideAction: action,
        context: {
          apiHost: props.context.apiHost,
          sessionId: props.initialChatReply.sessionId,
        },
        onMessageStream: streamMessage,
      })
      if (response && 'logs' in response) saveLogs(response.logs)
      if (response && 'replyToSend' in response) {
        setIsSending(false)
        sendMessage(
          response.replyToSend ? { type: 'text', value: response.replyToSend } : undefined,
        )
        return
      }
      if (response && 'blockedPopupUrl' in response) setBlockedPopupUrl(response.blockedPopupUrl)
    }
  }

  createEffect(() => {
    setTheme(parseDynamicTheme(props.initialChatReply.bot.theme, dynamicTheme()))
  })

  onCleanup(() => {
    setStreamingMessage(undefined)
    setFormattedMessages([])
  })

  return (
    <InputAnswerContext.Provider
      value={{
        chatChunks,
        theme,
        dynamicTheme,
        setTheme,
        answers,
        setAnswer,
        getAnswer,
        hasError,
        setHasError,
        blockRef,
        currentBlock,
        blockedPopupUrl,
        setBlockedPopupUrl,
        isSending,
        displayedMessageIndexes,
        setDisplayedMessageIndex,
        getDisplayedMessageIndex,
        sendMessage,
        processClientSideActions,
      }}
    >
      {props.children}
    </InputAnswerContext.Provider>
  )
}

export const useInputAnswer = () => {
  const context = useContext(InputAnswerContext)
  if (!context) {
    throw new Error('useInputAnswer must be used within an InputAnswerProvider')
  }
  return context
}
