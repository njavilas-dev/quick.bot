import { InputFormLayout } from '@/components/InputFormLayout'
import { InputSubmitContent } from '@/types'
import { DateInputBlock } from '@quickbot.io/schemas'
import { createSignal } from 'solid-js'
import { defaultDateInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/date/constants'
import clsx from 'clsx'

type Props = {
  onSubmit: (inputValue: InputSubmitContent) => void
  options?: DateInputBlock['options']
  defaultValue?: string
}

export const DateForm = (props: Props) => {
  const [inputValues, setInputValues] = createSignal(parseDefaultValue(props.defaultValue ?? ''))

  const submit = () => {
    if (inputValues().from === '' && inputValues().to === '') return
    props.onSubmit({
      type: 'text',
      value: `${inputValues().from}${props.options?.isRange ? ` to ${inputValues().to}` : ''}`,
    })
  }

  return (
    <InputFormLayout
      onSubmit={submit}
      buttonLabel={props.options?.labels?.button}
    >
      <div class={clsx('flex flex-col w-full', props.options?.isRange ? 'items-end' : 'items-center')}>
        <div class={'flex items-center ' + (props.options?.isRange ? 'pb-0 gap-2' : '')}>
          {props.options?.isRange && (
            <p class="font-normal">
              {props.options.labels?.from ?? defaultDateInputOptions.labels.from}
            </p>
          )}
          <input
            class="focus:outline-none flex-1 w-full input__field input__date"
            style={{
              'min-height': '32px',
              'min-width': '100px',
              'font-size': '16px',
            }}
            value={inputValues().from}
            type={props.options?.hasTime ? 'datetime-local' : 'date'}
            onChange={(e) =>
              setInputValues({
                ...inputValues(),
                from: e.currentTarget.value,
              })
            }
            min={props.options?.min}
            max={props.options?.max}
            data-testid="from-date"
          />
        </div>
        {props.options?.isRange && (
          <div class="flex items-center p-4 h-full">
            {props.options.isRange && (
              <p class="font-normal">
                {props.options.labels?.to ?? defaultDateInputOptions.labels.to}
              </p>
            )}
            <input
              class="focus:outline-none flex-1 w-full ml-2 h-full input__date--styled"
              style={{
                'min-height': '32px',
                'min-width': '100px',
                'font-size': '16px',
              }}
              value={inputValues().to}
              type={props.options.hasTime ? 'datetime-local' : 'date'}
              onChange={(e) =>
                setInputValues({
                  ...inputValues(),
                  to: e.currentTarget.value,
                })
              }
              min={props.options?.min}
              max={props.options?.max}
              data-testid="to-date"
            />
          </div>
        )}
      </div>
    </InputFormLayout>
  )
}

const parseDefaultValue = (defaultValue: string) => {
  if (!defaultValue.includes('to')) return { from: defaultValue, to: '' }
  const [from, to] = defaultValue.split(' to ')
  return { from, to }
}
