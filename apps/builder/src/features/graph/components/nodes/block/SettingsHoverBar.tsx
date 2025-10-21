import { BuoyIcon, CopyIcon, ExpandIcon, PlayIcon, TrashIcon } from '@urbiport/icons'
import { Button, HStack, IconButton, Link } from '@chakra-ui/react'
import { BlockWithOptions } from '@quickbot.io/schemas'
import { getHelpDocUrl } from '@/features/graph/helpers/getHelpDocUrl'
import { useTranslate } from '@tolgee/react'
import { VideoOnboardingPopover } from '@/features/onboarding/components/VideoOnboardingPopover'
import { forgedBlocks } from '@quickbot.io/forge-repository/definitions'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { useEditor } from '@/features/editor/providers/EditorProvider'
import { useBot } from '@/features/editor/providers/BotProvider'
import { BlockIndices } from '@quickbot.io/schemas'

type Props = {
  blockType: BlockWithOptions['type']
  blockDef?: (typeof forgedBlocks)[keyof typeof forgedBlocks]
  isVideoOnboardingItemDisplayed: boolean
  onExpandClick: () => void
  onVideoOnboardingClick: () => void
  block: BlockWithOptions
  indices: BlockIndices
  groupId: string
}

export const SettingsHoverBar = ({
  blockType,
  blockDef,
  isVideoOnboardingItemDisplayed,
  onExpandClick,
  onVideoOnboardingClick,
  block,
  indices,
  groupId,
}: Props) => {
  const { t } = useTranslate()
  const { setPreviewingBlock } = useGraph()
  const { setShowPreviewDrawer } = useEditor()
  const { deleteBlock, duplicateBlock } = useBot()
  const helpDocUrl = getHelpDocUrl(blockType, blockDef)

  const handlePlayClick = () => {
    setPreviewingBlock({ id: block.id, groupId })
    setShowPreviewDrawer(true)
  }

  const handleDuplicateClick = () => duplicateBlock(indices)

  const handleDeleteClick = () => deleteBlock(indices)

  return (
    <HStack borderRadius="md" spacing={0} borderWidth="1px" bgColor="bg.dark" shadow="md">
      <IconButton
        icon={<PlayIcon color="text.light" />}
        borderRightWidth="1px"
        borderRightRadius="none"
        aria-label={'Preview bot from this block'}
        variant="ghost"
        onClick={handlePlayClick}
        size="xs"
      />
      <IconButton
        icon={<ExpandIcon color="text.light" />}
        borderRightWidth="1px"
        borderRightRadius="none"
        borderLeftRadius="none"
        aria-label={'Expand settings'}
        variant="ghost"
        onClick={onExpandClick}
        size="xs"
      />
      <IconButton
        icon={<CopyIcon color="text.light" />}
        borderRightWidth="1px"
        borderRightRadius="none"
        borderLeftRadius="none"
        aria-label={'Duplicate block'}
        variant="ghost"
        onClick={handleDuplicateClick}
        size="xs"
      />
      <IconButton
        icon={<TrashIcon color="text.light" />}
        borderRightWidth="1px"
        borderRightRadius="none"
        borderLeftRadius="none"
        aria-label={'Delete block'}
        variant="ghost"
        onClick={handleDeleteClick}
        size="xs"
      />
      {helpDocUrl && (
        <Button
          as={Link}
          leftIcon={<BuoyIcon color="text.light" />}
          borderLeftRadius="none"
          borderRightRadius={isVideoOnboardingItemDisplayed ? 0 : undefined}
          borderRightWidth={isVideoOnboardingItemDisplayed ? '1px' : undefined}
          size="xs"
          variant="ghost"
          href={helpDocUrl}
          isExternal
        >
          {t('help')}
        </Button>
      )}
      {isVideoOnboardingItemDisplayed && (
        <VideoOnboardingPopover.TriggerIconButton
          onClick={onVideoOnboardingClick}
          size="xs"
          borderLeftRadius="none"
        />
      )}
    </HStack>
  )
}
