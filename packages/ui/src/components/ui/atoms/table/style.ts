import { defineStyleConfig } from '@chakra-ui/react'

export const Table = defineStyleConfig({
  baseStyle: {
    thead: {
      th: {
        color: 'text.normal',
      },
    },
  },
  variants: {
    card: {
      table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 12px',
      },
      thead: {
        th: {
          paddingY: 6,
          paddingX: 4,
          fontWeight: 'bold',
          color: 'gray.600',
          textAlign: 'left',
        },
      },
      tbody: {
        tr: {
          borderRadius: 'md',
          paddingX: 4,
          paddingY: 2,
          boxShadow: '0 0 0 1px var(--chakra-colors-divider-light)',
        },
      },
      td: {
        bg: 'bg.normal',
        paddingY: 6,
        paddingX: 4,
        textAlign: 'left',
        _first: {
          borderLeftRadius: 12,
        },
        _last: {
          borderRightRadius: 12,
        },
      },
    },
    simple: {
      table: {
        width: '100%',
        minWidth: '650px',
        thead: {
          th: {
            pl: 0,
            pr: 0,
            color: 'text.test',
            fontSize: 'sm',
            borderColor: 'divider.light',
            textTransform: 'capitalize',
            fontWeight: 'semibold',
          },
        },
      },
      td: {
        pl: 0,
        pr: 0,
        color: 'text.test',
        fontSize: 'sm',
        borderColor: 'divider.light',
      },
    },
    table: {
      table: {
        Thead: {
          th: {
            color: 'text.light',
            fontSize: 'sm',
            textTransform: 'capitalize',
            fontWeight: 'semibold',
            backgroundColor: 'bg.dark',
            borderColor: 'divider.light',
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
            padding: 4,
          },
        },
        td: {
          color: 'text.light',
          fontSize: 'sm',
          borderColor: 'divider.light',
          borderBottomWidth: '1px',
          py: 2,
          px: 4,
          __last: {
            borderBottomWidth: 0,
          }
        },
      },
    },
  },
})
