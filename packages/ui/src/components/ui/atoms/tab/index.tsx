import React, { ForwardedRef } from 'react'
import { Tab as ChakraTab, TabProps as ChakraTabProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const Tab = React.forwardRef(
  (props: ChakraTabProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraTab ref={ref} {...props} />
  },
)
Tab.displayName = 'Tab'
