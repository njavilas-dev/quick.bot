import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

import {
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
} from '@chakra-ui/react'
import { useOnChangeDebounced } from '../../../../hooks'

type ValidatorFn = (value: string, options?: Record<string, unknown>) => boolean

const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  alpha: /^[a-zA-Z]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  name: /^[a-zA-Z\s]+$/,
  tel: /^\+?[0-9\s\-()]{7,}$/,
  date: /^\d{4}-\d{2}-\d{2}$/, // ISO (YYYY-MM-DD)
  time: /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, // 24h (HH:MM o HH:MM:SS)
  color: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
  week: /^\d{4}-W\d{2}$/, // ISO (YYYY-W##)
  month: /^\d{4}-(0[1-9]|1[0-2])$/, // YYYY-MM
  safeText: /^[\w\s\-.,!?()']+$/,
}

const validateEmpty: ValidatorFn = (value, options) => {
  const allowEmpty = options?.allowEmpty as boolean ?? true
  return allowEmpty || value.trim().length > 0
}

const validatePattern: ValidatorFn = (value, options) => {
  if (value.length === 0) return true

  const pattern = options?.pattern as RegExp | keyof typeof patterns
  const regex = typeof pattern === 'string' ? patterns[pattern] : pattern

  return regex.test(value)
}

const validateLength: ValidatorFn = (value, options) => {
  const min = options?.min as number ?? 0
  const max = options?.max as number ?? Infinity

  return value.length >= min && value.length <= max
}

const validatorsByType: Record<string, Array<{ fn: ValidatorFn, options?: Record<string, unknown> }>> = {
  email: [
    { fn: validateEmpty, options: { allowEmpty: true } },
    { fn: validatePattern, options: { pattern: 'email' } }
  ],
  url: [
    { fn: validateEmpty, options: { allowEmpty: true } },
    { fn: validatePattern, options: { pattern: 'url' } }
  ],
  tel: [
    { fn: validateEmpty, options: { allowEmpty: true } }
  ],
  number: [
    { fn: validateEmpty, options: { allowEmpty: true } },
    { fn: validatePattern, options: { pattern: 'number' } }
  ],
  password: [
    { fn: validateEmpty, options: { allowEmpty: false } },
    { fn: validateLength, options: { min: 8 } }
  ]
}

export interface ValidationOptions {
  allowEmpty?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp | keyof typeof patterns
  customValidators?: Array<{ fn: ValidatorFn, options?: Record<string, unknown> }>
  allowInvalidOnChange?: boolean
}

export type InputTextProps = {
  readOnly?: boolean
  defaultValue?: string
  onChange?: (value: string) => void
  validationOptions?: ValidationOptions
  debounceTimeout?: number
  placeholder?: string
  isDisabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
} & Omit<InputProps, 'onChange' | 'onBlur'>

export const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  (
    {
      type,
      defaultValue,
      debounceTimeout = 0,
      onChange: _onChange,
      onBlur,
      validationOptions,
      size,
      maxWidth,
      leftIcon,
      rightIcon,
      ...props
    }: InputTextProps,
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [isInvalid, setIsInvalid] = useState<boolean>(false)
    const [localValue, setLocalValue] = useState<string>(defaultValue ?? '')
    const { onChange, flush } = useOnChangeDebounced<string>({
      onChange: _onChange ?? (() => { }),
      debounceTimeout,
    })

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    useEffect(() => {
      setLocalValue(defaultValue ?? '')
    }, [defaultValue])

    const applyValidator = (
      value: string,
      validator: { fn: ValidatorFn, options?: Record<string, unknown> }
    ): boolean => {
      const { fn, options } = validator

      if (options) {
        return fn(value, options)
      }
      return fn(value)
    }

    const validateInput = (value: string): boolean => {

      if (validationOptions) {
        if (validationOptions.customValidators) {
          for (const validator of validationOptions.customValidators) {
            if (!applyValidator(value, validator)) {
              return false
            }
          }
        }
        if (validationOptions.allowEmpty === false && value.trim().length === 0) {
          return false
        }
        if (validationOptions.minLength && value.length < validationOptions.minLength) {
          return false
        }
        if (validationOptions.maxLength && value.length > validationOptions.maxLength) {
          return false
        }
        if (validationOptions.pattern && value.length > 0) {
          return validatePattern(value, { pattern: validationOptions.pattern })
        }
      }
      if (type && validatorsByType[type] && !validationOptions?.customValidators) {
        for (const validator of validatorsByType[type]) {
          if (!applyValidator(value, validator)) {
            return false
          }
        }
      }
      return true
    }

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setLocalValue(value)

      const isValid = validateInput(value)

      setIsInvalid(!isValid)

      if (validationOptions?.allowInvalidOnChange || isValid) {
        onChange(value)
      }
    }

    const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) {
        onBlur(e)
      }
      flush()
    }

    return (
      <InputGroup>
        {leftIcon && <InputLeftElement height="100%">{leftIcon}</InputLeftElement>}
        <Input
          type={type}
          ref={inputRef}
          value={localValue}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          size={size}
          maxWidth={maxWidth}
          isInvalid={isInvalid}
          {...props}
        />
        {rightIcon && <InputRightElement height="100%">{rightIcon}</InputRightElement>}
      </InputGroup>
    )
  },
)

InputText.displayName = 'InputText'
