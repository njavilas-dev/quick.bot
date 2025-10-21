import { children, JSX, Show, splitProps } from 'solid-js'
import { Spinner } from './Spinner'
import clsx from 'clsx'

type Props = {
  children: JSX.Element
  isDisabled?: boolean
  isLoading?: boolean
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = (props: Props) => {
  const childrenReturn = children(() => props.children)
  const [local, buttonProps] = splitProps(props, ['disabled', 'class'])

  const isDisabled = props.isDisabled || props.isLoading

  return (
    <button
      {...buttonProps}
      disabled={isDisabled}
      class={clsx(
        'p-2 font-normal focus:outline-none filter hover:brightness-90 active:brightness-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 flex justify-center transition-all duration-300 quickbot__button',
        local.class,
      )}
    >
      <Show when={!props.isLoading} fallback={<Spinner />}>
        {childrenReturn()}
      </Show>
    </button>
  )
}
