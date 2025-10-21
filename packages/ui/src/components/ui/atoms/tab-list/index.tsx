import React, { ForwardedRef } from 'react'
import { TabList as ChakraTabList, TabListProps as ChakraTabListProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const TabList = React.forwardRef(
  (props: ChakraTabListProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraTabList ref={ref} {...props} />
  },
)
TabList.displayName = 'TabList'
