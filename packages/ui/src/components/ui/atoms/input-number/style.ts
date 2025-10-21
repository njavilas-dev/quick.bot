import { defineStyleConfig } from '@chakra-ui/react'
import { Input } from '../input/style'

export const InputNumber = defineStyleConfig({
  ...Input,
  variants: {
    ...Input.variants,
  },
})
