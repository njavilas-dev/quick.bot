import { SubmitButton } from '@/components/SubmitButton'
import { JSX, Show } from 'solid-js'
import clsx from 'clsx'

interface InputFormLayoutProps {
  children: JSX.Element
  onSubmit: () => void
  buttonLabel?: string
  isDisabled?: boolean
  class?: string
  customButton?: JSX.Element
}

/**
 * Common layout component for input forms
 * Provides consistent structure and styling for all input components
 * Always uses a form element to normalize submit behavior
 */
export const InputFormLayout = (props: InputFormLayoutProps) => {
  const {
    children,
    onSubmit,
    buttonLabel,
    isDisabled = false,
    class: className,
    customButton,
  } = props

  return (
    <form
      class={clsx(
        ' flex w-full gap-2 items-end border rounded-2xl px-3 py-2 input__form',
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div class="flex input w-full h-full transition-all duration-100">
        {children}
      </div>

      <Show
        when={customButton}
        fallback={
          <SubmitButton
            isDisabled={isDisabled}
          >
            {buttonLabel}
          </SubmitButton>
        }
      >
        {customButton}
      </Show>
    </form>
  )
}
