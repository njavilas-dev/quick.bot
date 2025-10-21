import React from 'react'
import { Checkbox as ChakraCheckbox, CheckboxProps as ChakraCheckboxProps } from '@chakra-ui/react'
import { theme } from './theme'

export const Checkbox: React.FC<ChakraCheckboxProps> = (props) => {
  return (
    <div>
      <ChakraCheckbox size={props.size ?? theme.size} {...props} />
    </div>
  )
}
