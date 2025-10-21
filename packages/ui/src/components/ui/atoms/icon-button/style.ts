import { defineStyleConfig } from '@chakra-ui/react'
import { Button } from '../button/style'

export const IconButton = defineStyleConfig({
  ...Button,
  variants: {
    ...Button.variants,
  },
})
