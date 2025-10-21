import { defineStyleConfig } from '@chakra-ui/react'

export const StepSeparator = defineStyleConfig({
  baseStyle: {
    transition: 'all 0.2s',
    _horizontal: {
      '[data-status=complete] &': {
        bg: 'brand.primary',
      },
      '[data-status=active] &': {
        bg: 'divider.light',
      },
      '[data-status=incomplete] &': {
        bg: 'divider.light',
      },
    },
    _vertical: {
      '[data-status=complete] &': {
        bg: 'brand.primary',
      },
      '[data-status=active] &': {
        bg: 'divider.light',
      },
      '[data-status=incomplete] &': {
        bg: 'divider.light',
      },
    }
  },
})