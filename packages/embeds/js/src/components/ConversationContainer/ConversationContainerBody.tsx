import { StartChatResponse } from '@quickbot.io/schemas'
import { For, onMount, Show } from 'solid-js'
import { ChatChunk } from './ChatChunk'
import { BotContext } from '@/types'
import { isNotDefined } from '@quickbot.io/lib'
import { PopupBlockedToast } from './PopupBlockedToast'
import { useInputAnswer } from '../InputAnswerContext'
import { autoScrollToBottom } from './helpers'

type Props = {
  initialChatReply: StartChatResponse
  context: BotContext
  onEnd?: () => void
}

export const ConversationContainerBody = (props: Props) => {
  const {
    chatChunks,
    theme,
    hasError,
    blockRef,
    blockedPopupUrl,
    setBlockedPopupUrl,
    isSending,
    sendMessage,
    processClientSideActions,
  } = useInputAnswer()

  let chatContainer: HTMLDivElement | undefined

  onMount(() => {
    ;(async () => {
      const initialChunk = chatChunks()[0]
      if (!initialChunk.clientSideActions) return
      const actionsBeforeFirstBubble = initialChunk.clientSideActions.filter((action) =>
        isNotDefined(action.lastBubbleBlockId),
      )
      await processClientSideActions(actionsBeforeFirstBubble)
    })()
  })

  const handleAllBubblesDisplayed = async () => {
    const lastChunk = [...chatChunks()].pop()
    if (!lastChunk) return
    if (isNotDefined(lastChunk.input)) {
      props.onEnd?.()
    }
  }

  const handleNewBubbleDisplayed = async (blockId: string) => {
    const lastChunk = [...chatChunks()].pop()
    if (!lastChunk) return
    if (lastChunk.clientSideActions) {
      const actionsToExecute = lastChunk.clientSideActions.filter(
        (action) => action.lastBubbleBlockId === blockId,
      )
      await processClientSideActions(actionsToExecute)
    }
  }

  const handleSkip = () => sendMessage(undefined)

  return (
    <div
      ref={chatContainer}
      class="flex flex-col overflow-y-auto w-full px-5 pt-10 relative scroll-smooth gap-2 flex-[9] quickbot__chat-container"
    >
      <For each={chatChunks()}>
        {(chatChunk, index) => {
          return (
            <ChatChunk
              blockRef={blockRef}
              index={index()}
              messages={chatChunk.messages}
              input={chatChunk.input}
              theme={theme()}
              settings={props.initialChatReply.bot.settings}
              streamingMessageId={chatChunk.streamingMessageId}
              context={props.context}
              hideAvatar={
                !chatChunk.input &&
                ((chatChunks()[index() + 1]?.messages ?? 0).length > 0 ||
                  chatChunks()[index() + 1]?.streamingMessageId !== undefined ||
                  (chatChunk.messages.length > 0 && isSending()))
              }
              hasError={hasError() && index() === chatChunks().length - 1}
              isTransitionDisabled={index() !== chatChunks().length - 1}
              onNewBubbleDisplayed={handleNewBubbleDisplayed}
              onAllBubblesDisplayed={handleAllBubblesDisplayed}
              onSubmit={sendMessage}
              onScrollToBottom={(ref, offset) => autoScrollToBottom(chatContainer, ref, offset)}
              onSkip={handleSkip}
            />
          )
        }}
      </For>
      <Show when={blockedPopupUrl()} keyed>
        {(blockedPopupUrl) => (
          <div class="flex justify-end">
            <PopupBlockedToast
              url={blockedPopupUrl}
              onLinkClick={() => setBlockedPopupUrl(undefined)}
            />
          </div>
        )}
      </Show>
    </div>
  )
}
