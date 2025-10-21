import React, { forwardRef } from 'react'

import { CopyButton, InputText, InputTextProps } from '../../atoms'

export const InputTextCopy = forwardRef<HTMLInputElement, InputTextProps>(
  (
    {
      defaultValue,
      ...props
    }: InputTextProps,
    ref,
  ) => {
    return (
      <InputText
        ref={ref}
        defaultValue={defaultValue}
        rightIcon={
          <CopyButton
            aria-label="Copy"
            size="sm"
            textToCopy={defaultValue ?? ''}
          />
        }
        {...props}
      />
    )
  },
)

InputTextCopy.displayName = 'InputTextCopy'
