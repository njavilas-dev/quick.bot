import { defineStyleConfig } from '@chakra-ui/react'

export const Icon = defineStyleConfig({
  baseStyle: {
    fill: 'currentColor',
    fontSize: 'inherit',
  },
  sizes: {
    xs: {
      fontSize: '14px',
    },
    sm: {
      fontSize: '20px',
    },
    md: {
      fontSize: '24px',
    },
    lg: {
      fontSize: '28px',
    },
  },
})
