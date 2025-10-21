import { TypingBubble } from '@/components'
import { isMobile } from '@/utils/isMobileSignal'
import { AudioBubbleBlock } from '@quickbot.io/schemas'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { defaultAudioBubbleContent } from '@quickbot.io/schemas/features/blocks/bubbles/audio/constants'
import clsx from 'clsx'

type Props = {
  content: AudioBubbleBlock['content']
  onTransitionEnd?: (ref?: HTMLDivElement) => void
}

const showAnimationDuration = 400
const typingDuration = 100

let typingTimeout: NodeJS.Timeout

export const AudioBubble = (props: Props) => {
  let isPlayed = false
  let ref: HTMLDivElement | undefined
  let audioElement: HTMLAudioElement | undefined
  const [isTyping, setIsTyping] = createSignal(props.onTransitionEnd ? true : false)

  onMount(() => {
    typingTimeout = setTimeout(() => {
      if (isPlayed) return
      isPlayed = true
      setIsTyping(false)
      setTimeout(() => props.onTransitionEnd?.(ref), showAnimationDuration)
    }, typingDuration)
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
        <div class="flex relative z-10 items-start max-w-full bubble--host">
          <div
            class="flex items-center absolute px-4 py-2 z-10 transition-all duration-[400ms] ease-out bubble__typing"
            style={{
              width: isTyping() ? '64px' : '100%',
              height: isTyping() ? '32px' : '100%',
            }}
          >
            {isTyping() && <TypingBubble />}
          </div>
          <audio
            ref={audioElement}
            src={props.content?.url}
            autoplay={
              props.onTransitionEnd
                ? props.content?.isAutoplayEnabled ?? defaultAudioBubbleContent.isAutoplayEnabled
                : false
            }
            class={
              'z-10 transition-opacity duration-[400ms] ease-in delay-200 quickbot__text--fade-in ' +
              (isTyping() ? 'opacity-0' : 'opacity-100 m-2')
            }
            style={{
              height: isTyping() ? (isMobile() ? '32px' : '36px') : 'revert',
            }}
            controls
          />
        </div>
      </div>
    </div>
  )
}
