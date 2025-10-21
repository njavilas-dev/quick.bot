import React from 'react'
import {
  StepSeparator as ChakraStepSeparator,
  StepSeparatorProps as ChakraStepSeparatorProps,
  useStyleConfig,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const StepSeparator = React.forwardRef<HTMLDivElement, ChakraStepSeparatorProps>(
  (props, ref): IReactElement => {
    const styles = useStyleConfig('StepSeparator')
    return <ChakraStepSeparator ref={ref} sx={styles} {...props} />
  },
)
StepSeparator.displayName = 'StepSeparator'
