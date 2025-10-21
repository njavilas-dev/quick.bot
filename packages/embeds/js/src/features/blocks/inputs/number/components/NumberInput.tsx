import { InputFormLayout } from '@/components/InputFormLayout'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { NumberInputBlock } from '@quickbot.io/schemas'
import { createSignal, onMount } from 'solid-js'
import { numberInputHelper } from '../numberInputHelper'
import { defaultNumberInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/number/constants'
import { useMessageListener } from '@/hooks/useMessageListener'

type NumberInputProps = {
  block: NumberInputBlock
  defaultValue?: string
  onSubmit: (value: InputSubmitContent) => void
}

export const NumberInput = (props: NumberInputProps) => {
  const [inputValue, setInputValue] = createSignal<string | number>(props.defaultValue ?? '')
  const [staticValue, bindValue, targetValue] = numberInputHelper(() => inputValue())
  let inputRef: HTMLInputElement | undefined

  const checkIfInputIsValid = () => inputRef?.value !== '' && inputRef?.reportValidity()

  const submit = () => {
    if (checkIfInputIsValid())
      props.onSubmit({
        type: 'text',
        value: inputRef?.value ?? inputValue().toString(),
      })
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
      <input
        ref={inputRef}
        class="focus:outline-none bg-transparent flex-1 w-full input__field"
        style={{ 'font-size': '16px', appearance: 'auto' }}
        value={staticValue}
        // @ts-expect-error not defined
        // eslint-disable-next-line solid/jsx-no-undef
        use:bindValue
        placeholder={
          props.block.options?.labels?.placeholder ?? defaultNumberInputOptions.labels.placeholder
        }
        onInput={(e) => {
          setInputValue(targetValue(e.currentTarget))
        }}
        type="number"
        min={props.block.options?.min}
        max={props.block.options?.max}
        step={props.block.options?.step ?? 'any'}
      />
    </InputFormLayout>
  )
}
