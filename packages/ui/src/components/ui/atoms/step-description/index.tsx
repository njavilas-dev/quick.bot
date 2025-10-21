import React from 'react'
import {
  StepDescription as ChakraStepDescription,
  StepDescriptionProps as ChakraStepDescriptionProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const StepDescription = React.forwardRef<HTMLDivElement, ChakraStepDescriptionProps>(
  (props, ref): IReactElement => {
    return <ChakraStepDescription ref={ref} {...props} />
  },
)
StepDescription.displayName = 'StepDescription'
