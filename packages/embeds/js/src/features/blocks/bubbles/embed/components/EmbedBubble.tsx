import { TypingBubble } from '@/components'
import { isMobile } from '@/utils/isMobileSignal'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { clsx } from 'clsx'
import { EmbedBubbleBlock } from '@quickbot.io/schemas'
import { defaultEmbedBubbleContent } from '@quickbot.io/schemas/features/blocks/bubbles/embed/constants'
import { isNotEmpty } from '@quickbot.io/lib'
import { InputSubmitContent } from '@/types'

type Props = {
  content: EmbedBubbleBlock['content']
  onTransitionEnd?: (ref?: HTMLDivElement) => void
  onCompleted?: (data?: InputSubmitContent) => void
}

let typingTimeout: NodeJS.Timeout

const showAnimationDuration = 400

export const EmbedBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  const [isTyping, setIsTyping] = createSignal(props.onTransitionEnd ? true : false)

  const handleMessage = (event: MessageEvent<{ name?: string; data?: string }>) => {
    if (
      props.content?.waitForEvent?.isEnabled &&
      isNotEmpty(event.data.name) &&
      event.data.name === props.content?.waitForEvent.name
    ) {
      props.onCompleted?.(
        props.content.waitForEvent.saveDataInVariableId && event.data.data
          ? {
              type: 'text',
              value: event.data.data,
            }
          : undefined,
      )
      window.removeEventListener('message', handleMessage)
    }
  }

  onMount(() => {
    typingTimeout = setTimeout(() => {
      setIsTyping(false)
      if (props.content?.waitForEvent?.isEnabled) {
        window.addEventListener('message', handleMessage)
      }
      setTimeout(() => {
        props.onTransitionEnd?.(ref)
      }, showAnimationDuration)
    }, 2000)
  })

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout)
    window.removeEventListener('message', handleMessage)
  })

  return (
    <div
      class={clsx('flex flex-col w-full', props.onTransitionEnd ? 'animate-fade-in' : undefined)}
      ref={ref}
    >
      <div class="flex w-full items-center">
        <div class="flex relative z-10 items-start w-full max-w-full bubble--host">
          <div
            class="flex items-center absolute px-4 py-2 z-10 transition-all duration-[400ms] ease-out bubble__typing"
            style={{
              width: isTyping() ? '64px' : '100%',
              height: isTyping() ? '32px' : '100%',
            }}
          >
            {isTyping() && <TypingBubble />}
          </div>
          <div
            class={clsx(
              'p-4 z-20 quickbot__text--fade-in w-full transition-opacity duration-[400ms] ease-in delay-200',
              isTyping() ? 'opacity-0' : 'opacity-100 p-4',
            )}
            style={{
              height: isTyping()
                ? isMobile()
                  ? '32px'
                  : '36px'
                : `${props.content?.height ?? defaultEmbedBubbleContent.height}px`,
            }}
          >
            <iframe
              id="embed-bubble-content"
              src={props.content?.url}
              class={'w-full h-full rounded-md'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
