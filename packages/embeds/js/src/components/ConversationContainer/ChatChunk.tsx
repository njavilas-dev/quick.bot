import { InputSubmitContent, BotContext, ChatChunk as ChatChunkType } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import { ContinueChatResponse, Settings, Theme } from '@quickbot.io/schemas'
import { createSignal, For, onMount, Show, createEffect } from 'solid-js'
import { HostBubble } from '../bubbles/HostBubble'
import { InputChatBlock } from '../InputChatBlock'
import { AvatarSideContainer } from './AvatarSideContainer'
import { StreamingBubble } from '../bubbles/StreamingBubble'
import { defaultSettings } from '@quickbot.io/schemas/features/bot/settings/constants'
import {
  defaultGuestAvatarIsEnabled,
  defaultHostAvatarIsEnabled,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { useInputAnswer } from '../InputAnswerContext'

type Props = Pick<ContinueChatResponse, 'messages' | 'input'> & {
  blockRef: HTMLDivElement | undefined
  theme: Theme
  settings: Settings
  index: number
  context: BotContext
  hasError: boolean
  hideAvatar: boolean
  streamingMessageId: ChatChunkType['streamingMessageId']
  isTransitionDisabled?: boolean
  onNewBubbleDisplayed: (blockId: string) => Promise<void>
  onScrollToBottom: (ref?: HTMLDivElement, offset?: number) => void
  onSubmit: (answer?: InputSubmitContent) => void
  onSkip: () => void
  onAllBubblesDisplayed: () => void
}

export const ChatChunk = (props: Props) => {
  let inputRef: HTMLDivElement | undefined
  const { getDisplayedMessageIndex, setDisplayedMessageIndex } = useInputAnswer()
  const [lastBubble, setLastBubble] = createSignal<HTMLDivElement>()

  // Initialize displayedMessageIndex for this chunk
  createEffect(() => {
    if (props.isTransitionDisabled) {
      setDisplayedMessageIndex(props.index, props.messages.length)
    } else {
      setDisplayedMessageIndex(props.index, 0)
    }
  })

  const displayedMessageIndex = () => getDisplayedMessageIndex(props.index)

  onMount(() => {
    if (props.streamingMessageId) return
    if (props.messages.length === 0) {
      props.onAllBubblesDisplayed()
    }
    props.onScrollToBottom(inputRef, 50)
  })

  const displayNextMessage = async (bubbleRef?: HTMLDivElement) => {
    if (
      (props.settings.typingEmulation?.delayBetweenBubbles ??
        defaultSettings.typingEmulation.delayBetweenBubbles) > 0 &&
      displayedMessageIndex() < props.messages.length - 1
    ) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          (props.settings.typingEmulation?.delayBetweenBubbles ??
            defaultSettings.typingEmulation.delayBetweenBubbles) * 1000,
        ),
      )
    }
    const lastBubbleBlockId = props.messages[displayedMessageIndex()].id
    await props.onNewBubbleDisplayed(lastBubbleBlockId)
    setDisplayedMessageIndex(
      props.index,
      displayedMessageIndex() === props.messages.length
        ? displayedMessageIndex()
        : displayedMessageIndex() + 1,
    )
    props.onScrollToBottom(bubbleRef)
    if (displayedMessageIndex() === props.messages.length) {
      setLastBubble(bubbleRef)
      props.onAllBubblesDisplayed()
    }
  }

  return (
    <div class="flex flex-col w-full min-w-0 gap-2">
      <Show when={props.messages.length > 0}>
        <div class={'flex' + (isMobile() ? ' gap-1' : ' gap-2')}>
          <Show
            when={
              (props.theme.chat?.hostAvatar?.isEnabled ?? defaultHostAvatarIsEnabled) &&
              props.messages.length > 0
            }
          >
            <AvatarSideContainer
              hostAvatarSrc={props.theme.chat?.hostAvatar?.url}
              hideAvatar={props.hideAvatar}
              isTransitionDisabled={props.isTransitionDisabled}
            />
          </Show>

          <div class="flex flex-col flex-1 gap-2 w-10">
            <For each={props.messages.slice(0, displayedMessageIndex() + 1)}>
              {(message, idx) => (
                <HostBubble
                  message={message}
                  typingEmulation={props.settings.typingEmulation}
                  isTypingSkipped={
                    (props.settings.typingEmulation?.isDisabledOnFirstMessage ??
                      defaultSettings.typingEmulation.isDisabledOnFirstMessage) &&
                    props.index === 0 &&
                    idx() === 0
                  }
                  onTransitionEnd={props.isTransitionDisabled ? undefined : displayNextMessage}
                  onCompleted={props.onSubmit}
                />
              )}
            </For>
          </div>
        </div>
      </Show>
      <Show when={displayedMessageIndex() === props.messages.length && props.input}>
        {(block) => (
          <InputChatBlock
            ref={inputRef}
            block={block()}
            chunkIndex={props.index}
            hasHostAvatar={props.theme.chat?.hostAvatar?.isEnabled ?? defaultHostAvatarIsEnabled}
            guestAvatar={props.theme.chat?.guestAvatar}
            context={props.context}
            isInputPrefillEnabled={
              props.settings.general?.isInputPrefillEnabled ??
              defaultSettings.general.isInputPrefillEnabled
            }
            hasError={props.hasError}
            onTransitionEnd={() => props.onScrollToBottom(lastBubble())}
            onSubmit={props.onSubmit}
            onSkip={props.onSkip}
          />
        )}
      </Show>
      <Show when={props.streamingMessageId} keyed>
        {(streamingMessageId) => (
          <div class={'flex' + (isMobile() ? ' gap-1' : ' gap-2')}>
            <Show when={props.theme.chat?.hostAvatar?.isEnabled ?? defaultHostAvatarIsEnabled}>
              <AvatarSideContainer
                hostAvatarSrc={props.theme.chat?.hostAvatar?.url}
                hideAvatar={props.hideAvatar}
              />
            </Show>

            <div
              class="flex flex-col flex-1 gap-2"
              ref={props.blockRef}
              style={{
                'max-width':
                  props.theme.chat?.guestAvatar?.isEnabled ?? defaultGuestAvatarIsEnabled
                    ? isMobile()
                      ? 'calc(100% - 60px)'
                      : 'calc(100% - 48px - 48px)'
                    : '100%',
              }}
            >
              <StreamingBubble streamingMessageId={streamingMessageId} context={props.context} />
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}
