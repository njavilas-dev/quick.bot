import { defineStyleConfig } from '@chakra-ui/react'

export const Input = defineStyleConfig({
  baseStyle: {
    field: {
      borderRadius: 'md',
      _placeholder: {
        color: 'text.light',
      },
    },
  },
  variants: {
    outline: {
      field: {
        borderColor: 'divider.light',
        _hover: {
          borderColor: '#000000',
        },
        _focus: {
          borderColor: 'brand.primary',
          boxShadow: '0 0 0 1px #00CD62',
        },
      },
    },
    filled: {
      field: {
        bg: 'rgba(0, 0, 0, 0.09)',
        borderColor: 'divider.light',
        _hover: {
          bg: '#000000',
          borderColor: 'rgba(0, 0, 0, 0.9)',
        },
        _focus: {
          bg: 'white',
          borderColor: 'brand.primary',
        },
      },
    },
  },
  defaultProps: {
    size: 'md',
    variant: 'outline',
  },
})
