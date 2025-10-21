import { Stack, StackProps } from '@chakra-ui/react'
import React from 'react'

const StackCardStyle: StackProps = {
  direction: 'row',
  spacing: 4,
  border: '1px solid',
  borderColor: 'divider.lighter',
  borderRadius: 'md',
  p: 6,
}

export const StackCard: React.FC<StackProps> = ({ children, ...props }) => {
  return (
    <Stack {...StackCardStyle} {...props}>
      {children}
    </Stack>
  )
}
