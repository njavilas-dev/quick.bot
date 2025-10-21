import { defineStyleConfig } from '@chakra-ui/react'

export const Tag = defineStyleConfig({
  variants: {
    subtle: {
      size: 'sm',
    },
    orange: {
      bg: 'orange.400',
      color: 'white',
      size: 'sm',
      ml: '1',
    },
    blue: {
      colorScheme: 'blue',
      ml: '1',
      size: 'sm',
    },
    red: {
      colorScheme: 'red',
      ml: '1',
      size: 'sm',
    },
    purple: {
      colorScheme: 'purple',
      ml: '1',
      size: 'sm',
    },
    gray: {
      color: 'gray.400',
    },
    botInfo: {
      bgColor: 'gray.300',
      rounded: 'full',
      size: 'sm',
      variant: 'solid',
    },
    statusRed: {
      colorScheme: 'red',
    },
    statusGreen: {
      colorScheme: 'green',
    },
    statusBlue: {
      colorScheme: 'blue',
    },
    statusOrange: {
      colorScheme: 'orange',
    },
    botButton: {
      colorScheme: 'blue',
      top: '27px',
      pos: 'aboslute',
      rounded: 'full',
      variant: 'solid',
      size: 'sm',
    },
    pricingCard: {
      pos: 'absolute',
      top: '-10px',
      colorScheme: 'blue',
      bg: 'blue.400',
      variant: 'solid',
      fontWeight: 'semibold',
    },
  },
})
