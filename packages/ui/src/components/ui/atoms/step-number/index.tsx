import React from 'react'
import {
  StepNumber as ChakraStepNumber,
  StepNumberProps as ChakraStepNumberProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const StepNumber = React.forwardRef<HTMLDivElement, ChakraStepNumberProps>(
  (props, ref): IReactElement => {
    return <ChakraStepNumber ref={ref} {...props} />
  },
)
StepNumber.displayName = 'StepNumber'
