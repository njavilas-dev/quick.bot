import { defineStyleConfig } from '@chakra-ui/react'
import { Input } from '../../atoms/input/style'

export const Textarea = defineStyleConfig({
  ...Input,
  variants: {
    ...Input.variants,
  },
})
