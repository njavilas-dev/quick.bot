import React from 'react'
import { Box, CircularProgress, CircularProgressProps, Text } from '@chakra-ui/react'

export const CircleProgressBar = (props: CircularProgressProps) => {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress value={props.value} {...props} />
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="sm" color="white">
          {`${Math.round(props.value || 0)}%`}
        </Text>
      </Box>
    </Box>
  )
}
