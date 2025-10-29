import { Flex, Text } from '@chakra-ui/react'
import { BlockWithItems } from '@quickbot.io/schemas'
import React from 'react'
import { BlockSourceEndpoint } from '../../endpoints/BlockSourceEndpoint'

export const ItemNodeOtherwise = ({ block, groupId, label }: { block: BlockWithItems; groupId: string, label: string }) => {

  return (
    <Flex
      justify="start"
      w="100%"
      pos="relative"
      p={4}
      shadow="sm"
      bg={'bg.normal'}
      borderRadius="md"
      outline="1px solid var(--chakra-colors-gray-100)"
      _hover={{ shadow: 'md' }}
      transition="box-shadow 200ms, border-color 200ms"
    >
      <Text color="text.light">
        {label}
      </Text>
      <BlockSourceEndpoint
        source={{
          blockId: block.id,
        }}
        groupId={groupId}
        pos="absolute"
        right="-49px"
      />
    </Flex >
  )
}
