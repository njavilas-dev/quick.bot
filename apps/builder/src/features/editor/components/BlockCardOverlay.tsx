import { StackProps, HStack } from '@chakra-ui/react'
import { BlockIcon } from './BlockIcon'
import { BlockLabel } from './BlockLabel'
import { BlockV6 } from '@quickbot.io/schemas'

export const BlockCardOverlay = ({ type, ...props }: StackProps & { type: BlockV6['type'] }) => {
  return (
    <HStack
      borderWidth="1px"
      borderRadius="lg"
      cursor={'grabbing'}
      w="147px"
      transition="none"
      pointerEvents="none"
      px="4"
      py="2"
      borderColor="divider.normal"
      bgColor="bg.normal"
      shadow="xl"
      zIndex={2}
      {...props}
    >
      <BlockIcon type={type} />
      <BlockLabel type={type} />
    </HStack>
  )
}
