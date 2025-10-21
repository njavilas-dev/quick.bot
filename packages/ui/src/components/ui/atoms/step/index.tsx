import React from 'react'
import { Step as ChakraStep, StepProps as ChakraStepProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const Step = React.forwardRef<HTMLDivElement, ChakraStepProps>(
  (props, ref): IReactElement => {
    return <ChakraStep ref={ref} {...props} />
  },
)
Step.displayName = 'Step'
