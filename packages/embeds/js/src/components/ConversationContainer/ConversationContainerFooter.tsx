import { LiteBadge } from '../LiteBadge'
import { ContinueChatResponse, InputBlock, StartChatResponse } from '@quickbot.io/schemas'
import { Show } from 'solid-js'
import { BotContext, OutgoingLog } from '@/types'
import { InputChatBlockFooter } from '../InputChatBlockFooter'
import { defaultSettings } from '@quickbot.io/schemas/features/bot/settings/constants'
import { useInputAnswer } from '../InputAnswerContext'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { autoScrollToBottom } from './helpers'

type Props = {
  botContainer: HTMLDivElement | undefined
  initialChatReply: StartChatResponse
  context: BotContext
  onNewInputBlock?: (inputBlock: InputBlock) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
  onProgressUpdate?: (progress: number) => void
}

export const ConversationContainerFooter = (props: Props) => {
  const {
    getDisplayedMessageIndex,
    chatChunks,
    theme,
    hasError,
    blockRef,
    currentBlock,
    sendMessage,
  } = useInputAnswer()

  const handleSkip = () => sendMessage(undefined)

  return (
    <div class="quickbot__conversation-footer">
      <Show
        when={(() => {
          const current = currentBlock()
          return (
            getDisplayedMessageIndex(chatChunks().length - 1) ===
              (current?.messages?.length ?? 0) &&
            isTextBasedInput(current?.input) &&
            current?.input
          )
        })()}
      >
        {(input) => (
          <InputChatBlockFooter
            block={input()}
            chunkIndex={chatChunks().length - 1}
            hasHostAvatar={theme().chat?.hostAvatar?.isEnabled ?? false}
            guestAvatar={theme().chat?.guestAvatar}
            context={props.context}
            isInputPrefillEnabled={
              props.initialChatReply.bot.settings.general?.isInputPrefillEnabled ??
              defaultSettings.general.isInputPrefillEnabled
            }
            hasError={hasError()}
            onSubmit={sendMessage}
            onTransitionEnd={() => autoScrollToBottom(blockRef)}
            onSkip={handleSkip}
          />
        )}
      </Show>
      <Show when={props.initialChatReply.bot.settings.general?.isBrandingEnabled}>
        <LiteBadge botContainer={props.botContainer} />
      </Show>
    </div>
  )
}
const isTextBasedInput = (input: ContinueChatResponse['input']) => {
  if (!input) return false
  return input.type !== InputBlockType.CHOICE
}
