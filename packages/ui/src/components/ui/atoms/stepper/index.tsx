import React from 'react'
import { Stepper as ChakraStepper, StepperProps as ChakraStepperProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const Stepper = React.forwardRef<HTMLDivElement, ChakraStepperProps>(
  (props, ref): IReactElement => {
    return <ChakraStepper ref={ref} {...props} />
  },
)
Stepper.displayName = 'Stepper'
