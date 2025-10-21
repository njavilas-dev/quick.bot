import React from 'react'
import {
  StepTitle as ChakraStepTitle,
  StepTitleProps as ChakraStepTitleProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const StepTitle = React.forwardRef<HTMLDivElement, ChakraStepTitleProps>(
  (props, ref): IReactElement => {
    return <ChakraStepTitle ref={ref} {...props} />
  },
)
StepTitle.displayName = 'StepTitle'
