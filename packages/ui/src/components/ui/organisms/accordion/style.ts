import { defineStyleConfig } from '@chakra-ui/react'

export const Accordion = defineStyleConfig({
  baseStyle: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    },
    // @ts-expect-error - This is a known type issue due to Chakra UI's type definitions
    container: {
      borderTopWidth: '1px',
      borderColor: 'divider.light',
      overflow: 'hidden',
      m: 0,
      _first: {
        borderTop: 'none',
      },
      _last: {
        borderBottom: 'none',
      },
    },
    button: {
      variant: 'unstyled',
      fontWeight: 'bold',
      bg: 'bg.normal',
      _expanded: { bg: 'bg.normal' },
      p: 4,
      justifyContent: 'space-between',
      display: 'flex',
      icon: {
        transition: 'transform 0.2s',
        _expanded: {
          transform: 'rotate(180deg)',
        },
      },
    },
    panel: {
      py: 4,
      px: 4,
    },
  },
  variants: {
    flat: {
      root: {
        gap: 4,
      },
      // @ts-expect-error - This is a known type issue due to Chakra UI's type definitions
      container: {
        borderRadius: 'md',
        borderWidth: '1px',
        borderColor: 'divider.light',
        overflow: 'hidden',
        m: 0,
        _first: {
          borderTop: 'solid',
          borderWidth: '1px',
          borderColor: 'divider.light',
        },
        _last: {
          borderBottom: 'solid',
          borderWidth: '1px',
          borderColor: 'divider.light',
        },
      },
    },
  },
})
