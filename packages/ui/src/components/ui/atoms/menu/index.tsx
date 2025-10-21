import React from 'react'
import { Menu as ChakraMenu, MenuProps as ChakraMenuProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const Menu = (props: ChakraMenuProps): IReactElement => {
  return <ChakraMenu {...props} />
}
Menu.displayName = 'Menu'
