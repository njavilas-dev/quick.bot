import { defineStyleConfig } from '@chakra-ui/react'

export const StepIndicator = defineStyleConfig({
  baseStyle: {
    borderRadius: 'md',
    transition: 'all 0.2s',
    '[data-status=complete] &': {
      bg: 'brand.primary',
      borderColor: 'brand.primary',
      color: 'white',
    },
    '[data-status=active] &': {
      bg: 'brand.primary',
      borderColor: 'brand.primary',
      color: 'white',
    },
    '[data-status=incomplete] &': {
      bg: 'transparent',
      borderColor: 'divider.light',
      color: 'text.lighter',
    },
  },
  sizes: {
    sm: {
      h: '24px',
      w: '24px',
      fontSize: 'xs',
    },
    md: {
      h: '32px',
      w: '32px',
      fontSize: 'sm',
    },
    lg: {
      h: '40px',
      w: '40px',
      fontSize: 'md',
    },
  },
  defaultProps: {
    size: 'md',
  },
})