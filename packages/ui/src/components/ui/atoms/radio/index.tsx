import React, { ForwardedRef } from 'react'
import { Radio as ChakraRadio, RadioProps as ChakraRadioProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'
import { theme } from './theme'

import './theme.scss'

export const Radio = React.forwardRef(
  (props: ChakraRadioProps, ref: ForwardedRef<HTMLButtonElement>): IReactElement => {
    const { variant, ...restProps } = props
    return <ChakraRadio ref={ref} variant={variant ?? theme.variant} {...restProps} />
  },
)
Radio.displayName = 'Radio'
