import React from 'react'
import {
  MenuOptionGroup as ChakraMenuOptionGroup,
  MenuOptionGroupProps as ChakraMenuOptionGroupProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const MenuOptionGroup = (props: ChakraMenuOptionGroupProps): IReactElement => {
  return <ChakraMenuOptionGroup {...props} />
}
MenuOptionGroup.displayName = 'MenuOptionGroup'
