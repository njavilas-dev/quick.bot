import { forwardRef } from 'react'
import { InputNumber, InputNumberProps } from '@urbiport/ui'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { IconButton } from '@chakra-ui/react'
import { VariableIcon } from '@urbiport/icons'
import { useTranslate } from '@tolgee/react'
import { Variable, VariableString } from '@quickbot.io/schemas'

type ExtendedInputNumberBaseProps = {
  debounceTimeout?: number
  withVariableButton?: boolean
  usePortal?: boolean
} & Omit<InputNumberProps, 'defaultValue' | 'onChange'>

type ExtendedInputNumberWithVariablesProps = ExtendedInputNumberBaseProps & {
  withVariableButton: true
  defaultValue?: number | VariableString
  onChange?: (value?: number | VariableString) => void
}

type ExtendedInputNumberWithoutVariablesProps = ExtendedInputNumberBaseProps & {
  withVariableButton?: false
  defaultValue?: number
  onChange?: (value?: number) => void
}

type ExtendedInputNumberProps =
  | ExtendedInputNumberWithVariablesProps
  | ExtendedInputNumberWithoutVariablesProps

export const InputNumberWithVariables = forwardRef<HTMLInputElement, ExtendedInputNumberProps>(
  (
    {
      withVariableButton = false,
      defaultValue,
      onChange,
      usePortal = true,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslate()

    const handleVariableSelected = (variable?: Variable) => {
      if (!variable) return
      if (!withVariableButton) return
      if (typeof variable?.name !== 'string') return
        ; (onChange as (value: VariableString) => void)?.(`{{${variable.name}}}`)
    }

    const handleNumberChange = (value?: number | string) => {
      if (typeof value === 'number') {
        onChange?.(value)
      } else if (value === '' || value == null) {
        onChange?.(undefined)
      }
      return
    }

    return (
      <InputNumber
        ref={ref}
        defaultValue={defaultValue}
        onChange={handleNumberChange}
        leftIcon={
          withVariableButton && (
            <VariablesDropdown
              placement="bottom-end"
              matchWidth={false}
              onSelect={handleVariableSelected}
              menuButtonProps={{
                as: IconButton,
                variant: 'ghost',
                justifyContent: 'center',
                icon: <VariableIcon color="text.light" />,
                'aria-label': t('variables.button.tooltip'),
                px: 2,
                size: 'sm',
                w: '16px',
              }}
              usePortal={usePortal}
            />
          )
        }
        {...props}
      />
    )
  },
)

InputNumberWithVariables.displayName = 'InputNumberWithVariables'
