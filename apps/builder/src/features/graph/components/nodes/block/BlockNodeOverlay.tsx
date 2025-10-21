import { BlockIcon } from '@/features/editor/components/BlockIcon'
import { StackProps, HStack } from '@chakra-ui/react'
import { BlockIndices, BlockV6 } from '@quickbot.io/schemas'
import { BlockNodeContent } from './BlockNodeContent'

export const BlockNodeOverlay = ({
  block,
  indices,
  ...props
}: { block: BlockV6; indices: BlockIndices } & StackProps) => {
  return (
    <HStack
      p="3"
      borderWidth="1px"
      borderRadius="lg"
      borderColor="divider.lighter"
      bgColor="bg.normal"
      cursor={'grab'}
      w="264px"
      pointerEvents="none"
      shadow="lg"
      {...props}
    >
      <BlockIcon type={block.type} />
      <BlockNodeContent block={block} indices={indices} groupId="" />
    </HStack>
  )
}
