import { menuAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys)

const baseStyle = definePartsStyle({
  item: {
    bg: 'bg.normal',
    _hover: {
      bg: 'divider.subtle',
    },
    _focus: {
      bg: 'divider.subtle',
    },
    _selected: {
      bg: 'divider.lighter',
    },
    borderRadius: 'sm',
  },
  list: {
    bg: 'bg.normal',
    borderColor: 'divider.light',
    boxShadow: 'lg',
  },
})

export const Menu = defineMultiStyleConfig({ baseStyle })
