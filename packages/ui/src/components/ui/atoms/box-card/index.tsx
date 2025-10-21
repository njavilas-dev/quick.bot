import { Box, BoxProps } from '@chakra-ui/react'
import React, { forwardRef } from 'react'

const BoxCardStyle: BoxProps = {
  borderRadius: 'md',
  padding: 6,
  display: 'flex',
  gap: 6,
  justifyContent: 'start',
  flexDirection: 'column',
  position: 'relative',
  bg: 'bg.normal',
}

type BoxFunctionalProps = {
  withBorders?: boolean
}

type Props = BoxProps & BoxFunctionalProps

export const BoxCard = forwardRef<HTMLDivElement, Props>(({ children, withBorders = true, ...props }, ref) => {

  return (
    <Box
      ref={ref}
      {...BoxCardStyle}
      border={withBorders ? '1px solid' : 'none'}
      borderColor={withBorders ? 'divider.light' : 'none'}
      {...props}
    >
      {children}
    </Box>
  )
})

BoxCard.displayName = 'BoxCard'
