import React from 'react'
import {
  MenuDivider as ChakraMenuDivider,
  MenuDividerProps as ChakraMenuDividerProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const MenuDivider = (props: ChakraMenuDividerProps): IReactElement => {
  return <ChakraMenuDivider {...props} />
}

MenuDivider.displayName = 'MenuDivider'
