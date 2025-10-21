import { defineStyleConfig } from '@chakra-ui/react'

export const Modal = defineStyleConfig({
  baseStyle: {
    dialogContainer: {
      zIndex: 9999,
    },
    dialog: {
      bg: 'bg.normal'
    }
  },
})
