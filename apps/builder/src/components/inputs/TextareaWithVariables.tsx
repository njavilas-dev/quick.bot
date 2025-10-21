import React, { useRef } from 'react'
import { Variable } from '@quickbot.io/schemas'
import { Textarea, TextareaProps } from '@urbiport/ui'
import { injectVariableInText } from '@/features/variables/helpers/injectVariableInTextInput'
import { focusInput } from '@/helpers/focusInput'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { VariableIcon } from '@urbiport/icons'
import { Box, IconButton } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'

export type TextareaWithVariables = {
  debounceTimeout?: number
  withVariableButton?: boolean
} & TextareaProps

export const TextareaWithVariables = ({
  withVariableButton,
  onChange,
  defaultValue,
  ...props
}: TextareaWithVariables) => {
  const { t } = useTranslate()

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) return
    const { text, carretPosition: newCarretPosition } = injectVariableInText({
      variable,
      text: defaultValue ?? '',
      at: textareaRef.current?.selectionStart ?? 0,
    })
    onChange?.(text)
    focusInput({ at: newCarretPosition, input: textareaRef.current })
  }

  return (
    <Box position="relative">
      {withVariableButton && (
        <VariablesDropdown
          placement="bottom-start"
          matchWidth={false}
          onSelect={handleVariableSelected}
          menuButtonProps={{
            m: 1,
            position: 'absolute',
            right: 0,
            zIndex: 999,
            as: IconButton,
            variant: 'outline',
            justifyContent: 'center',
            icon: <VariableIcon color="text.light" />,
            'aria-label': t('variables.button.tooltip'),
            px: 2,
            size: 'sm',
            w: '16px',
          }}
        />
      )}
      <Textarea ref={textareaRef} onChange={onChange} defaultValue={defaultValue} {...props} />
    </Box>
  )
}
