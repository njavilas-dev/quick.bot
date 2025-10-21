import { defineStyleConfig } from '@chakra-ui/react'

const outline = {
  bg: 'transparent',
  border: '1px solid',
  borderColor: 'divider.light',
  shadow: 'none',
  _hover: {
    bg: 'divider.light',
    borderColor: 'divider.normal',
  },
  _checked: {
    bg: 'divider.light',
  },
  _active: {
    bg: 'divider.light',
  },
}

const solid = {
  bg: 'green.500',
  color: 'white',
  boxShadow:
    '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
  transition:
    'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  _hover: {
    bg: 'green.600',
    boxShadow:
      '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
  },
  _checked: {
    bg: 'green.600',
  },
  _active: {
    bg: 'primary.700',
    boxShadow:
      '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)',
  },
}

export const Button = defineStyleConfig({
  baseStyle: {
    fontWeight: 'medium',
    transition: 'all 0.2s',
    borderRadius: 'md',
  },
  variants: {
    solid: {
      bg: 'green.500',
      color: 'white',
      boxShadow:
        '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
      transition:
        'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      _hover: {
        bg: 'green.600',
        boxShadow:
          '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
      },
      _checked: {
        bg: 'green.600',
      },
      _active: {
        bg: 'primary.700',
        boxShadow:
          '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
      },
      _disabled: {
        bg: 'green.450',
        boxShadow:
          '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
      },
    },
    ghost: {
      bg: 'transparent',
    },
    outline: outline,
    link: {
      bg: 'transparent',
      boxShadow: 'none',
      _hover: {
        boxShadow: 'none',
      },
      _checked: {
        boxShadow: 'none',
      },
      _active: {
        boxShadow: 'none',
      },
    },
    menu: {
      bg: 'transparent',
      color: 'text.light',
      _hover: {
        bg: 'green.50',
        color: 'brand.dark',
      },
      _checked: {
        bg: 'green.50',
        color: 'brand.dark',
      },
      _active: {
        bg: 'green.50',
        color: 'brand.dark',
      },
    },
    'ghost:link': {
      colorScheme: 'green',
      color: 'text.test',
      _hover: {
        bg: 'green.100',
      },
      _checked: {
        bg: 'green.100',
      },
      _active: {
        bg: 'green.100',
      },
    },
    'primary:link': {
      color: 'green.500',
      margin: 0,
      padding: 0,
      _hover: {
        textDecoration: 'underline',
      },
    },
    'outline:error': {
      color: 'red.500',
      ...outline,
    },
    'outline:primary': {
      color: 'green.500',
      ...outline,
    },
    'round:primary': {
      ...solid,
      rounded: 'full',
    },
    'squared:secondary': {
      ...solid,
      color: 'gray.700',
      bg: 'gray.200',
    },
    premium: {
      bg: 'brand.premium',
      color: 'white',
      boxShadow:
        '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
      transition:
        'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      _hover: {
        bg: 'alert.premium.color',
        boxShadow:
          '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
      },
      _checked: {
        bg: 'alert.premium.color',
      },
      _active: {
        bg: 'text.premium',
        boxShadow:
          '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)',
      },
      _disabled: {
        bg: 'alert.premium.bg',
        color: 'alert.premium.color',
        boxShadow:
          '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  defaultProps: {
    variant: 'solid',
  },
})
