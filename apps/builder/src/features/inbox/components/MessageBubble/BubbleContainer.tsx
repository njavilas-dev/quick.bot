import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import type { BubbleVariant } from '../../types/message.types'
import { BubbleProvider } from './BubbleContext'

interface BubbleContainerProps {
  variant: BubbleVariant
  children: React.ReactNode
}

interface BubbleBoxProps {
  children?: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// Componente interno que aplica los bordes redondeados
export const BubbleBox = React.forwardRef<HTMLDivElement, BubbleBoxProps>(
  ({ children, ...boxProps }, ref) => {

    return (
      <Box
        ref={ref}
        borderRadius="lg"
        {...boxProps}
      >
        {children}
      </Box>
    )
  }
)

BubbleBox.displayName = 'BubbleBox'

// Contenedor principal que establece el contexto y layout
export const BubbleContainer: React.FC<BubbleContainerProps> = ({
  variant,
  children,
}) => {
  const isHost = variant === 'host'

  return (
    <BubbleProvider variant={variant}>
      <Box
        display="flex"
        justifyContent={isHost ? 'flex-start' : 'flex-end'}
        alignItems={isHost ? 'flex-start' : 'flex-end'}
        gap="2"
        w="full"
      >
        <Flex
          direction="column"
          gap="1"
          maxW={isHost ? 'full' : 'full'}
          alignItems={isHost ? 'flex-start' : 'flex-end'}
          w={isHost ? 'auto' : 'full'}
        >
          {children}
        </Flex>
      </Box>
    </BubbleProvider>
  )
}
