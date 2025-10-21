import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { Textarea as TextareaChakra, TextareaProps as TextareaPropsChakra } from '@chakra-ui/react'
import { useOnChangeDebounced } from '../../../../hooks'

export type TextareaProps = {
  defaultValue?: string
  onChange?: (value: string) => void
  debounceTimeout?: number
  placeholder?: string
  isDisabled?: boolean
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
} & Pick<
  TextareaPropsChakra,
  | 'minH'
  | 'width'
  | 'autoComplete'
  | 'onFocus'
  | 'onKeyUp'
  | 'autoFocus'
  | 'size'
  | 'maxWidth'
  | 'flexShrink'
>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      defaultValue,
      debounceTimeout = 0,
      placeholder,
      autoComplete,
      isDisabled,
      autoFocus,
      onChange: _onChange,
      onFocus,
      onKeyUp,
      onBlur,
      size,
      maxWidth,
      minH,
    }: TextareaProps,
    ref,
  ) => {
    const inputRef = useRef<HTMLTextAreaElement | null>(null)

    const [localValue, setLocalValue] = useState<string>(defaultValue ?? '')

    useImperativeHandle(ref, () => inputRef.current as HTMLTextAreaElement)

    const { onChange, flush } = useOnChangeDebounced<string>({
      onChange: _onChange ?? (() => { }),
      debounceTimeout,
    })

    useEffect(() => {
      if (localValue === defaultValue) return
      setLocalValue(defaultValue ?? '')
    }, [defaultValue])

    const changeValue = (value: string) => {
      setLocalValue(value)
      onChange(value)
    }

    const handleOnBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (onBlur) {
        onBlur(e)
      }
      flush()
    }

    return (
      <TextareaChakra
        ref={inputRef}
        value={localValue}
        autoComplete={autoComplete}
        placeholder={placeholder}
        isDisabled={isDisabled}
        autoFocus={autoFocus}
        onFocus={onFocus}
        onKeyUp={onKeyUp}
        onChange={(e) => changeValue(e.target.value)}
        onBlur={handleOnBlur}
        size={size}
        maxWidth={maxWidth}
        minH={minH ?? '150px'}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
