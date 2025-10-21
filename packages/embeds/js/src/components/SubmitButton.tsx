import { Switch, Match } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { SendIcon } from './icons'
import { Button } from './Button'
import { clsx } from 'clsx'

type SubmitButtonProps = {
  isDisabled?: boolean
  isLoading?: boolean
  class?: string
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

export const SubmitButton = (props: SubmitButtonProps) => {
  const hasLabel = !!props?.children
  return (
    <Button
      type="submit"
      aria-label={!hasLabel ? "Send" : undefined}
      class={clsx(
        hasLabel ? 'px-4' : undefined,
        props.class,
      )}
      {...props}
    >
      <Switch>
        <Match when={!hasLabel}>
          <SendIcon />
        </Match>
        <Match when={hasLabel}>{props.children}</Match>
      </Switch>
    </Button>
  )
}
