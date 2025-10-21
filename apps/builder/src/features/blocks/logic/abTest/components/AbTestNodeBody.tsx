import React from 'react'
import { Stack, Text, Tag, Button } from '@chakra-ui/react'
import { AbTestBlock } from '@quickbot.io/schemas'
import { BlockSourceEndpoint } from '@/features/graph/components/endpoints/BlockSourceEndpoint'
import { defaultAbTestOptions } from '@quickbot.io/schemas/features/blocks/logic/abTest/constants'

type Props = {
  block: AbTestBlock
  groupId: string
}

export const AbTestNodeBody = ({ block, groupId }: Props) => {
  return (
    <Stack spacing={6}>
      <Button variant="outline" justifyContent="space-between" alignContent="center">
        <Text>A</Text>
        <Tag>{block.options?.aPercent ?? defaultAbTestOptions.aPercent}%</Tag>
        <BlockSourceEndpoint
          source={{
            blockId: block.id,
            itemId: block.items[0].id,
          }}
          groupId={groupId}
          pos="absolute"
          right="-49px"
          pointerEvents="all"
        />
      </Button>
      <Button variant="outline" justifyContent="space-between" alignContent="center">
        <Text>B</Text>
        <Tag>{100 - (block.options?.aPercent ?? defaultAbTestOptions.aPercent)}%</Tag>
        <BlockSourceEndpoint
          source={{
            blockId: block.id,
            itemId: block.items[1].id,
          }}
          groupId={groupId}
          pos="absolute"
          right="-49px"
          pointerEvents="all"
        />
      </Button>
    </Stack>
  )
}
