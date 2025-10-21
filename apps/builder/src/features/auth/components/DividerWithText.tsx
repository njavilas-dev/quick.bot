import { FlexProps, Flex, Box, Divider, Text } from '@chakra-ui/react'
import React from 'react'

export const DividerWithText = (props: FlexProps) => {
  const { children, ...flexProps } = props
  return (
    <Flex align="center" color="gray.300" {...flexProps}>
      <Box flex="1">
        <Divider borderColor="currentcolor" />
      </Box>
      <Text as="span" px="3" fontWeight="medium" color="text.light">
        {children}
      </Text>
      <Box flex="1">
        <Divider borderColor="currentcolor" />
      </Box>
    </Flex>
  )
}
