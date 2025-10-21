import React, { ForwardedRef } from 'react'
import { Tabs as ChakraTabs, TabsProps as ChakraTabsProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const Tabs = React.forwardRef(
  (props: ChakraTabsProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraTabs ref={ref} {...props} />
  },
)
Tabs.displayName = 'Tabs'
