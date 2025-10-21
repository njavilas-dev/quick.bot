import { defineStyleConfig } from '@chakra-ui/react'
import { Input } from '../input/style'

export const InputNumberUnit = defineStyleConfig({
  ...Input,
  variants: {
    ...Input.variants,
  },
})
