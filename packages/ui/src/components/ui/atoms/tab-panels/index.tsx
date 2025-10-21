import React, { ForwardedRef } from 'react'
import {
  TabPanels as ChakraTabPanels,
  TabPanelsProps as ChakraTabPanelsProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const TabPanels = React.forwardRef(
  (props: ChakraTabPanelsProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraTabPanels ref={ref} {...props} />
  },
)
TabPanels.displayName = 'TabPanels'
