import React, { forwardRef, useEffect, useState } from 'react'

import { NumberInputProps, NumberInput, NumberInputField, InputGroup, InputRightElement } from '@chakra-ui/react'
import { useOnChangeDebounced } from '../../../../hooks'

export type InputNumberProps = {
  defaultValue?: number | string
  onChange?: (value?: number | string) => false | void
  debounceTimeout?: number
  suffix?: string
  placeholder?: string
  isDisabled?: boolean
  leftIcon?: React.ReactNode
  maxWidth?: string | number
  width?: string | number
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
} & Omit<NumberInputProps, 'defaultValue' | 'value' | 'onChange' | 'onBlur'>

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      suffix,
      defaultValue,
      debounceTimeout,
      placeholder,
      autoFocus,
      onChange: _onChange,
      onBlur,
      leftIcon,
      maxWidth = 'auto',
      width,
      ...props
    }: InputNumberProps,
    ref,
  ) => {
    const [localValue, setLocalValue] = useState(defaultValue?.toString() ?? '')
    const [isTouched, setIsTouched] = useState<boolean>(false)

    const { onChange, flush } = useOnChangeDebounced<number | string | undefined>({
      onChange: _onChange ?? (() => { }),
      debounceTimeout,
    })

    useEffect(() => {
      if (localValue === defaultValue?.toString()) return
      setLocalValue(defaultValue?.toString() ?? '')
    }, [defaultValue, isTouched])

    const onChangeValue = (newValue: string) => {
      if (!isTouched) setIsTouched(true)
      setLocalValue(newValue)
      if (newValue.endsWith('.') || newValue.endsWith(',')) return
      if (newValue === '') return onChange(undefined)
      const numberedValue = parseFloat(newValue)
      if (isNaN(numberedValue)) return
      onChange(numberedValue)
    }

    const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) {
        onBlur(e)
      }
      flush()
    }

    return (
      <InputGroup w={width} maxWidth={maxWidth}>
        <NumberInput
          ref={ref}
          parse={(val) => (suffix ? val.replace(` ${suffix}`, '') : val)}
          format={(val) => (suffix ? `${val} ${suffix}` : val)}
          value={localValue}
          onChange={onChangeValue}
          onBlur={handleOnBlur}
          {...props}
          w="full"
        >
          <NumberInputField w='full' placeholder={placeholder} autoFocus={autoFocus} />
        </NumberInput>
        {leftIcon && (
          <InputRightElement>
            {leftIcon}
          </InputRightElement>
        )}
      </InputGroup>
    )
  },
)

InputNumber.displayName = 'InputNumber'
