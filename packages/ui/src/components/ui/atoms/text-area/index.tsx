import React from 'react'
import { InputText, InputTextProps } from '../input-text'

export type TextAreaInputProps = Omit<InputTextProps, 'type' | 'inputMode'>

export const TextAreaInput = (props: TextAreaInputProps) => {
  return (
    <InputText {...props} as="textarea" minH="120px" paddingX={'6px'} />
  )
}
