import React from 'react'
import {
  StepIndicator as ChakraStepIndicator,
  StepIndicatorProps as ChakraStepIndicatorProps,
  useStyleConfig,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const StepIndicator = React.forwardRef<HTMLDivElement, ChakraStepIndicatorProps>(
  (props, ref): IReactElement => {
    const styles = useStyleConfig('StepIndicator')
    return <ChakraStepIndicator ref={ref} sx={styles} {...props} />
  },
)
StepIndicator.displayName = 'StepIndicator'
