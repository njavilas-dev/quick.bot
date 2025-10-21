import React, { useState, useRef } from 'react'
import { IconButton } from '@chakra-ui/react'
import { EyeOffIcon, EyeOnIcon, LockIcon } from '@urbiport/icons'
import { InputText, InputTextProps } from '../input-text'

export type InputPasswordProps = {
  readOnly?: boolean
  onChange?: (value: string) => void
} & Omit<InputTextProps, 'onChange' | 'leftIcon' | 'rightIcon' | 'readOnly' | 'type'>

export const InputPassword = ({ name, placeholder, size, validationOptions, onChange, ...props }: InputPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleToggleVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const recommendedPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

  const defaultValidationOptions = {
    allowEmpty: false,
    minLength: 8,
    pattern: recommendedPasswordPattern,
    allowInvalidOnChange: false,
    ...validationOptions,
  }

  const handlePasswordChange = (value: string) => {
    const isValid = recommendedPasswordPattern.test(value)
    // Update the submit button state based on validation
    if (formRef.current) {
      const submitButton = formRef.current.querySelector('button[type="submit"]') as HTMLButtonElement | null
      if (submitButton && !isValid && value.length > 0) {
        submitButton.disabled = true
      } else if (submitButton) {
        submitButton.disabled = false
      }
    }
    onChange?.(value)
  }

  // Find the parent form element
  React.useEffect(() => {
    if (inputRef.current) {
      let parent = inputRef.current.parentElement
      while (parent) {
        if (parent.tagName === 'FORM') {
          formRef.current = parent as HTMLFormElement
          break
        }
        parent = parent.parentElement
      }
    }
  }, [])

  return (
    <InputText
      ref={inputRef}
      type={showPassword ? 'text' : 'password'}
      name={name}
      placeholder={placeholder}
      size={size}
      leftIcon={<LockIcon color="text.light" />}
      validationOptions={defaultValidationOptions}
      onChange={handlePasswordChange}
      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$"
      rightIcon={
        <IconButton
          variant="unstyled"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="text.light"
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          icon={showPassword ? <EyeOffIcon /> : <EyeOnIcon />}
          onClick={handleToggleVisibility}
        />
      }
      {...props}
    />
  )
}
