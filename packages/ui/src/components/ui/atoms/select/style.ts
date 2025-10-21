import { defineStyleConfig } from '@chakra-ui/react'
import { Input } from '../input/style'

export const Select = defineStyleConfig({
  ...Input,
  variants: {
    ...Input.variants,
  },
})
