import React from 'react'
import { Box, Stack, Text, TextProps } from '@chakra-ui/react'
import { OutlinedBox } from '../../atoms/outlined-box'

export const CenteredTextWithOutline = (props: TextProps) => {
  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center">
        <OutlinedBox />
        <Text
          as={'span'}
          display="flex"
          alignItems="center"
          fontSize={props.fontSize}
          textAlign={props.textAlign}
          color={props.color}
          flexShrink={0}
          {...props}
        >
          <span>{props.children}</span>
        </Text>
        <OutlinedBox />
      </Stack>
    </Box>
  )
}
