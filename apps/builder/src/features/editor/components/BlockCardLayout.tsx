import { useBlockDnd } from '@/features/graph/providers/GraphDragAndDropProvider'
import { Tooltip, Flex, HStack } from '@chakra-ui/react'
import { BlockV6 } from '@quickbot.io/schemas'
import { useState, useEffect } from 'react'

type Props = {
  type: BlockV6['type']
  tooltip?: string
  isDisabled?: boolean
  children: React.ReactNode
  onMouseDown: (e: React.MouseEvent, type: BlockV6['type']) => void
}

export const BlockCardLayout = ({ type, onMouseDown, tooltip, children }: Props) => {
  const { draggedBlockType } = useBlockDnd()
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    setIsMouseDown(draggedBlockType === type)
  }, [draggedBlockType, type])

  const handleMouseDown = (e: React.MouseEvent) => onMouseDown(e, type)

  return (
    <Tooltip label={tooltip}>
      <Flex pos="relative">
        <HStack
          borderWidth="1px"
          borderColor="divider.light"
          borderRadius="md"
          flex="1"
          cursor={'grab'}
          opacity={isMouseDown ? '0.4' : '1'}
          onMouseDown={handleMouseDown}
          bgColor="bg.normal"
          px="4"
          py="2"
          _hover={{ bgColor: 'bg.hover' }}
          transition="box-shadow 200ms, background-color 200ms"
          data-testid={`block-card-${type}`}
        >
          {!isMouseDown ? children : null}
        </HStack>
      </Flex>
    </Tooltip>
  )
}
