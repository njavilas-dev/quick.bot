import React, { ForwardedRef } from 'react'
import {
  MenuButton as ChakraMenuButton,
  MenuButtonProps as ChakraMenuButtonProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const MenuButton = React.forwardRef(
  (props: ChakraMenuButtonProps, ref: ForwardedRef<HTMLButtonElement>): IReactElement => {
    return <ChakraMenuButton ref={ref} {...props} />
  },
)

MenuButton.displayName = 'MenuButton'
