import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon, PlayIcon } from '@urbiport/icons'
import { useTranslate } from '@tolgee/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { useEditor } from '@/features/editor/providers/EditorProvider'

type Props = {
  groupIndex: number
  groupId: string
}

export const GroupNodeContextMenu = ({ groupIndex, groupId }: Props) => {
  const { t } = useTranslate()
  const { duplicateGroup } = useBot()
  const { setPreviewingBlock } = useGraph()
  const { setShowPreviewDrawer, setStartPreviewAtGroup, setStartPreviewAtEvent } = useEditor()

  const handleDeleteClick = () => dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))

  const handleDuplicateClick = () => duplicateGroup(groupIndex)

  const handlePlayClick = () => {
    setStartPreviewAtEvent(undefined)
    setStartPreviewAtGroup(undefined)
    setTimeout(() => {
      setStartPreviewAtGroup(groupId)
      setPreviewingBlock({ id: '', groupId })
      setShowPreviewDrawer(true)
    }, 0)
  }

  return (
    <MenuList>
      <MenuItem icon={<PlayIcon />} onClick={handlePlayClick}>
        {t('editor.header.previewButton.label')}
      </MenuItem>
      <MenuItem icon={<CopyIcon />} onClick={handleDuplicateClick}>
        {t('duplicate')}
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        {t('delete')}
      </MenuItem>
    </MenuList>
  )
}
