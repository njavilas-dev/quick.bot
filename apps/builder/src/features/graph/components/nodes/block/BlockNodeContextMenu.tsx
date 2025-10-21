import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon } from '@urbiport/icons'
import { useBot } from '@/features/editor/providers/BotProvider'
import { BlockIndices, BlockV6 } from '@quickbot.io/schemas'
import { useTranslate } from '@tolgee/react'
import { ForgedBlockTurnIntoMenu } from '@/features/forge/components/ForgedBlockTurnIntoMenu'
import { TurnableIntoParam } from '@quickbot.io/forge'
import { ZodObject } from 'zod'

type Props = {
  indices: BlockIndices
  block: BlockV6
  /* eslint-disable @typescript-eslint/no-explicit-any */
  onTurnIntoClick: (params: TurnableIntoParam, schema: ZodObject<any>) => void
}

export const BlockNodeContextMenu = ({ indices, block, onTurnIntoClick }: Props) => {
  const { t } = useTranslate()
  const { deleteBlock, duplicateBlock } = useBot()

  const handleDuplicateClick = () => duplicateBlock(indices)

  const handleDeleteClick = () => deleteBlock(indices)

  return (
    <MenuList>
      <ForgedBlockTurnIntoMenu block={block} onTurnIntoClick={onTurnIntoClick} />
      <MenuItem icon={<CopyIcon />} onClick={handleDuplicateClick}>
        {t('duplicate')}
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        {t('delete')}
      </MenuItem>
    </MenuList>
  )
}
