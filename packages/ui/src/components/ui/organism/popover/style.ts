import { defineStyleConfig } from '@chakra-ui/react'

export const Popover = defineStyleConfig({
  baseStyle: {
    popper: {
      width: 'fit-content',
      maxWidth: 'fit-content',
      zIndex: 'dropdown',
    },
    content: {
      bg: 'bg.normal',
      borderColor: 'divider.light',
      shadow: 'lg',
    },
    body: {
      border: 'none',
      borderColor: 'divider.light',
    },
    arrow: {
      bg: 'bg.normal',
      '--popper-arrow-bg': 'var(--chakra-colors-bg-normal)',
      '--popper-arrow-shadow-color': 'var(--chakra-colors-divider-normal)',
    },
  },
})
