import React from 'react'
import {
  StepStatus as ChakraStepStatus,
  StepStatusProps as ChakraStepStatusProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const StepStatus = (props: ChakraStepStatusProps): IReactElement => {
  return <ChakraStepStatus {...props} />
}
StepStatus.displayName = 'StepStatus'
