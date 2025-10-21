import { FormControl, Select } from '@urbiport/ui'
import { useBot } from '@/features/editor/providers/BotProvider'
import { Stack } from '@chakra-ui/react'
import { JumpBlock } from '@quickbot.io/schemas/features/blocks/logic/jump'
import React from 'react'
import { byId, isNotEmpty } from '@quickbot.io/lib'
import { BlockIcon } from '@/features/editor/components/BlockIcon'

type Props = {
  groupId: string
  options: JumpBlock['options']
  onOptionsChange: (options: JumpBlock['options']) => void
}

export const JumpSettings = ({ groupId, options, onOptionsChange }: Props) => {
  const { bot } = useBot()

  const handleGroupIdChange = (groupId?: string) => onOptionsChange({ ...options, groupId })

  const handleBlockIdChange = (blockId?: string) => onOptionsChange({ ...options, blockId })

  const currentGroupId = bot?.groups.find(byId(groupId))?.id

  const selectedGroup = bot?.groups.find(byId(options?.groupId))

  if (!bot) return null

  return (
    <Stack spacing={6}>
      <FormControl>
        <Select
          items={bot.groups
            .filter((group) => group.id !== currentGroupId && isNotEmpty(group.title))
            .map((group) => ({
              label: group.title,
              value: group.id,
            }))}
          selectedItem={selectedGroup?.id}
          onSelect={handleGroupIdChange}
          placeholder="Select a group"
        />
      </FormControl>
      {selectedGroup && selectedGroup.blocks.length > 1 && (
        <FormControl>
          <Select
            selectedItem={options?.blockId}
            items={selectedGroup.blocks.map((block, index) => ({
              label: `Block #${(index + 1).toString()}`,
              value: block.id,
              icon: <BlockIcon type={block.type} />,
            }))}
            onSelect={handleBlockIdChange}
            placeholder="Select a block"
          />
        </FormControl>
      )}
    </Stack>
  )
}
