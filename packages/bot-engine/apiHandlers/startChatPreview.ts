import { Message, StartFrom, StartBot } from '@quickbot.io/schemas'
import { restartSession } from '../queries/restartSession'
import { saveStateToDatabase } from '../saveStateToDatabase'
import { startSession } from '../startSession'
import { computeCurrentProgress } from '../computeCurrentProgress'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'

type Props = {
  message?: Message
  isOnlyRegistering: boolean
  isStreamEnabled: boolean
  startFrom?: StartFrom
  botId: string
  bot?: StartBot
  userId?: string
  prefilledVariables?: Record<string, unknown>
  sessionId?: string
  textBubbleContentFormat: 'richText' | 'markdown'
}

export const startChatPreview = async ({
  message,
  isOnlyRegistering,
  isStreamEnabled,
  startFrom,
  botId,
  bot: startBot,
  userId,
  prefilledVariables,
  sessionId,
  textBubbleContentFormat,
}: Props) => {
  const {
    bot,
    messages,
    input,
    dynamicTheme,
    logs,
    clientSideActions,
    newSessionState,
    visitedEdges,
    setVariableHistory,
  } = await startSession({
    version: 2,
    startParams: {
      type: 'preview',
      isOnlyRegistering,
      isStreamEnabled,
      startFrom,
      botId,
      bot: startBot,
      userId,
      prefilledVariables,
      sessionId,
      textBubbleContentFormat,
      message,
      platform: 'web',
    },
  })

  const session = isOnlyRegistering
    ? await restartSession({
        state: newSessionState,
      })
    : await saveStateToDatabase({
        session: {
          state: newSessionState,
        },
        input,
        logs,
        clientSideActions,
        visitedEdges,
        setVariableHistory,
        hasEmbedBubbleWithWaitEvent: messages.some(
          (message) =>
            message.type === 'custom-embed' ||
            (message.type === BubbleBlockType.EMBED && message.content.waitForEvent?.isEnabled),
        ),
        initialSessionId: sessionId,
      })

  const isEnded =
    newSessionState.progressMetadata &&
    !input?.id &&
    (clientSideActions?.filter((c) => c.expectsDedicatedReply).length ?? 0) === 0

  return {
    sessionId: session.id,
    bot: {
      id: bot.id,
      theme: bot.theme,
      settings: bot.settings,
    },
    messages,
    input,
    dynamicTheme,
    logs,
    clientSideActions,
    progress: newSessionState.progressMetadata
      ? isEnded
        ? 100
        : computeCurrentProgress({
            botsQueue: newSessionState.botsQueue,
            progressMetadata: newSessionState.progressMetadata,
            currentInputBlockId: input?.id,
          })
      : undefined,
  }
}
