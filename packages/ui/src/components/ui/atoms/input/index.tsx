import React, { ForwardedRef } from 'react'
import { Input as ChakraInput, InputProps as ChakraInputProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'
import { theme } from './theme'

export const Input = React.forwardRef(
  (props: ChakraInputProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    const { variant, ...restProps } = props
    return <ChakraInput ref={ref} variant={variant || theme.variant} {...restProps} />
  },
)

Input.displayName = 'Input'
