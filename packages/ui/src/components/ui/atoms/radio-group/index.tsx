import React, { ForwardedRef } from 'react'
import {
  RadioGroup as ChakraRadioGroup,
  RadioGroupProps as ChakraRadioGroupProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

import './theme.scss'

export const RadioGroup = React.forwardRef(
  (props: ChakraRadioGroupProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraRadioGroup ref={ref} {...props} />
  },
)
RadioGroup.displayName = 'RadioGroup'
