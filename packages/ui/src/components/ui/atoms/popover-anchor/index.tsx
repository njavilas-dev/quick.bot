import React from 'react'
import { PopoverAnchor as ChakraPopoverAnchor } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const PopoverAnchor = (props: React.PropsWithChildren): IReactElement => {
  return <ChakraPopoverAnchor {...props} />
}

PopoverAnchor.displayName = 'PopoverAnchor'
