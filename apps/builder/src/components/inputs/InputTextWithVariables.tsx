import React, { forwardRef, useRef, useState } from 'react'
import { InputText, InputTextProps } from '@urbiport/ui'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { Variable } from '@quickbot.io/schemas'
import { injectVariableInText } from '@/features/variables/helpers/injectVariableInTextInput'
import { focusInput } from '@/helpers/focusInput'
import { IconButton } from '@chakra-ui/react'
import { VariableIcon } from '@urbiport/icons'
import { useTranslate } from '@tolgee/react'
import { isRefObject } from '@quickbot.io/lib'

type ExtendedInputTextProps = {
  debounceTimeout?: number
  withVariableButton?: boolean
  usePortal?: boolean
} & InputTextProps

export const InputTextWithVariables = forwardRef<HTMLInputElement, ExtendedInputTextProps>(
  (
    {
      withVariableButton = false,
      defaultValue,
      onChange,
      usePortal = true,
      rightIcon,
      ...props
    },
    forwardRef,
  ) => {
    const { t } = useTranslate()
    const localRef = useRef<HTMLInputElement>(null)
    const ref = isRefObject(forwardRef) ? forwardRef : localRef
    const [carretPosition, setCarretPosition] = useState<number>(defaultValue?.length ?? 0)

    const handleVariableSelected = (variable?: Variable) => {
      if (!variable) return
      const { text, carretPosition: newCarretPosition } = injectVariableInText({
        variable,
        text: defaultValue ?? '',
        at: carretPosition,
      })
      onChange?.(text)
      focusInput({ at: newCarretPosition, input: ref?.current })
    }

    const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const carretPosition = e.target.selectionStart
      if (!carretPosition) return
      setCarretPosition(carretPosition)
    }

    const RightIcon =
      rightIcon ||
      (withVariableButton && (
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
      ))

    return (
      <InputText
        ref={ref}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={handleOnBlur}
        {...props}
        rightIcon={RightIcon}
      />
    )
  },
)

InputTextWithVariables.displayName = 'InputTextWithVariables'
