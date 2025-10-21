import React, { ForwardedRef } from 'react'
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

interface CustomButtonProps extends ChakraButtonProps {
  href?: string
}

export const Button = React.forwardRef(
  (props: CustomButtonProps, ref: ForwardedRef<HTMLButtonElement>): IReactElement => {
    return <ChakraButton ref={ref} {...props} />
  },
)

Button.displayName = 'Button'
