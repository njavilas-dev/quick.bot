import React, { ForwardedRef } from 'react'
import { MenuList as ChakraMenuList, MenuListProps as ChakraMenuListProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const MenuList = React.forwardRef(
  (props: ChakraMenuListProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraMenuList ref={ref} {...props} />
  },
)
MenuList.displayName = 'MenuList'
