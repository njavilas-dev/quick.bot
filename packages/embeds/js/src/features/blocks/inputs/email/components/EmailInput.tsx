import { ShortTextInput } from '@/components'
import { InputFormLayout } from '@/components/InputFormLayout'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { EmailInputBlock } from '@quickbot.io/schemas'
import { createSignal, onMount } from 'solid-js'
import { defaultEmailInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/email/constants'
import { useMessageListener } from '@/hooks/useMessageListener'

type Props = {
  block: EmailInputBlock
  defaultValue?: string
  onSubmit: (value: InputSubmitContent) => void
}

export const EmailInput = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? '')
  let inputRef: HTMLInputElement | undefined

  const handleInput = (inputValue: string) => setInputValue(inputValue)

  const checkIfInputIsValid = () => inputRef?.value !== '' && inputRef?.reportValidity()

  const submit = () => {
    if (checkIfInputIsValid())
      props.onSubmit({ type: 'text', value: inputRef?.value ?? inputValue() })
    else inputRef?.focus()
  }

  useMessageListener((event) => {
    const { data } = event
    if (data.command === 'setInputValue') setInputValue(data.value)
  })

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus({ preventScroll: true })
  })

  return (
    <InputFormLayout
      onSubmit={submit}
      buttonLabel={props.block.options?.labels?.button}
    >
      <ShortTextInput
        ref={inputRef}
        value={inputValue()}
        placeholder={
          props.block.options?.labels?.placeholder ?? defaultEmailInputOptions.labels.placeholder
        }
        onInput={handleInput}
        type="email"
        autocomplete="email"
      />
    </InputFormLayout>
  )
}
