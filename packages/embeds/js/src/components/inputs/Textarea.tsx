import { isMobile } from '@/utils/isMobileSignal'
import { splitProps } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'

type TextareaProps = {
  ref?: HTMLTextAreaElement
  containerRef: HTMLDivElement
  onInput: (value: string) => void
} & Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onInput'>

export const Textarea = (props: TextareaProps) => {
  const [local, others] = splitProps(props, ['ref', 'onInput', 'containerRef'])

  const handleInput = (e: InputEvent & { currentTarget: HTMLTextAreaElement }) => {
    const el = e.currentTarget
    const minHeight = 25
    const maxHeight = 150

    // Reset to min height to properly recalculate scrollHeight
    el.style.height = `${minHeight}px`

    // Set new height between min and max
    const newHeight = Math.max(minHeight, Math.min(el.scrollHeight, maxHeight))
    el.style.height = `${newHeight}px`

    // Show scrollbar if content exceeds max height
    el.style.overflow = el.scrollHeight > maxHeight ? 'auto' : 'hidden'

    local.onInput(el.value)
  }

  return (
    <textarea
      ref={local.ref}
      id="user-input"
      class="focus:outline-none bg-transparent flex-1 w-full resize-none overflow-hidden h-[25px] input__field"
      data-testid="textarea"
      required
      autofocus={!isMobile()}
      onInput={handleInput}
      {...others}
    />
  )
}
