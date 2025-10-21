import React, { ForwardedRef } from 'react'
import { TabPanel as ChakraTabPanel, TabPanelProps as ChakraTabPanelProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const TabPanel = React.forwardRef(
  (props: ChakraTabPanelProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraTabPanel ref={ref} {...props} />
  },
)
TabPanel.displayName = 'TabPanel'
