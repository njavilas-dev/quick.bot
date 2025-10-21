import { TypingBubble } from '@/components'
import type { Settings, TextBubbleBlock } from '@quickbot.io/schemas'
import { For, createSignal, onCleanup, onMount } from 'solid-js'
import { PlateElement } from './plate/PlateBlock'
import { computePlainText } from '../helpers/convertRichTextToPlainText'
import { clsx } from 'clsx'
import { isMobile } from '@/utils/isMobileSignal'
import { computeTypingDuration } from '@quickbot.io/bot-engine/computeTypingDuration'

type Props = {
  content: TextBubbleBlock['content']
  typingEmulation: Settings['typingEmulation']
  isTypingSkipped: boolean
  onTransitionEnd?: (ref?: HTMLDivElement) => void
}

const showAnimationDuration = 400

let typingTimeout: NodeJS.Timeout

export const TextBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  const [isTyping, setIsTyping] = createSignal(props.onTransitionEnd ? true : false)

  const onTypingEnd = () => {
    if (!isTyping()) return
    setIsTyping(false)
    setTimeout(() => {
      props.onTransitionEnd?.(ref)
    }, showAnimationDuration)
  }

  onMount(() => {
    if (!isTyping) return
    const plainText = props.content?.richText ? computePlainText(props.content.richText) : ''
    const typingDuration =
      props.typingEmulation?.enabled === false || props.isTypingSkipped
        ? 0
        : computeTypingDuration({
            bubbleContent: plainText,
            typingSettings: props.typingEmulation,
          })
    typingTimeout = setTimeout(onTypingEnd, typingDuration)
  })

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout)
  })

  return (
    <div
      class={clsx('flex flex-col', props.onTransitionEnd ? 'animate-fade-in' : undefined)}
      ref={ref}
    >
      <div class="flex w-full items-center">
        <div class="flex relative items-start max-w-full bubble--host">
          <div
            class="flex items-center absolute px-4 py-2 transition-all duration-[400ms] ease-out bubble__typing"
            style={{
              width: isTyping() ? '64px' : '100%',
              height: isTyping() ? '32px' : '100%',
            }}
            data-testid="host-bubble"
          >
            {isTyping() && <TypingBubble />}
          </div>
          <div
            class={clsx(
              'overflow-auto quickbot__text--fade-in mx-4 my-3 whitespace-pre-wrap slate-html-container relative text-ellipsis transition-opacity duration-[400ms] ease-in delay-200',
              isTyping() ? 'opacity-0' : 'opacity-100',
            )}
            style={{
              height: isTyping() ? (isMobile() ? '16px' : '20px') : '100%',
            }}
          >
            <For each={props.content?.richText}>
              {(element) => <PlateElement element={element} />}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}
