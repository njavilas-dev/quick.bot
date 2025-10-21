import { ShortTextInput } from '@/components'
import { InputFormLayout } from '@/components/InputFormLayout'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { UrlInputBlock } from '@quickbot.io/schemas'
import { createSignal, onMount } from 'solid-js'
import { defaultUrlInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/url/constants'
import { useMessageListener } from '@/hooks/useMessageListener'

type Props = {
  block: UrlInputBlock
  defaultValue?: string
  onSubmit: (value: InputSubmitContent) => void
}

export const UrlInput = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? '')
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined

  const handleInput = (inputValue: string) => {
    setInputValue(inputValue)
  }

  const checkIfInputIsValid = () => inputRef?.value !== '' && inputRef?.reportValidity()

  const submit = () => {
    if (inputRef && !inputRef?.value.startsWith('http'))
      inputRef.value = `https://${inputRef.value}`
    if (checkIfInputIsValid())
      props.onSubmit({ type: 'text', value: inputRef?.value ?? inputValue() })
    else inputRef?.focus()
  }

  useMessageListener((event) => {
    const { data } = event
    if (data.command === 'setInputValue') setInputValue(data.value)
  })

  onMount(() => {
    if (!isMobile() && inputRef)
      inputRef.focus({
        preventScroll: true,
      })
  })

  return (
    <InputFormLayout
      onSubmit={submit}
      buttonLabel={props.block.options?.labels?.button}
    >
      <ShortTextInput
        ref={inputRef as HTMLInputElement}
        value={inputValue()}
        placeholder={
          props.block.options?.labels?.placeholder ?? defaultUrlInputOptions.labels.placeholder
        }
        onInput={handleInput}
        type="url"
        autocomplete="url"
      />
    </InputFormLayout>
  )
}
