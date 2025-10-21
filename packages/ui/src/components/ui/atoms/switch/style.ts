import { defineStyleConfig } from '@chakra-ui/react'

export const Switch = defineStyleConfig({
  baseStyle: {
    track: {
      display: 'flex',
      alignItems: 'center',
      _checked: {
        bg: 'green.300',
      },
    },
    thumb: {
      transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      transform: 'translateX(-10px)',
      _checked: {
        transform: 'translateX(16px)',
      },
    },
  },
  sizes: {
    md: {
      track: {
        w: '26px',
        h: '10px',
      },
      thumb: {
        w: '20px',
        h: '20px',
        boxShadow:
          '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        _checked: {
          bg: 'brand.primary',
        },
      },
    },
  },
  defaultProps: {
    size: 'md',
    colorScheme: 'green',
  },
})
