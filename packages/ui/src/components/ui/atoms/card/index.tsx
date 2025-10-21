import React, { ForwardedRef } from 'react'
import { Card as ChakraCard, CardProps as ChakraCardProps } from '@chakra-ui/react'
import { theme } from './theme'

export const Card = React.forwardRef(
  (props: ChakraCardProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { boxShadow, ...restProps } = props
    return <ChakraCard ref={ref} boxShadow={boxShadow || theme.boxShadow} {...restProps} />
  },
)

Card.displayName = 'Card'
