import { BuoyIcon, CopyIcon, ExpandIcon, PlayIcon, TrashIcon } from '@urbiport/icons'
import { Button, ButtonGroup, IconButton, Link, SlideFade } from '@chakra-ui/react'
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
  groupId: string,
  isHovering: boolean
}

export const BlockSettingsActionBar = ({
  blockType,
  blockDef,
  isVideoOnboardingItemDisplayed,
  onExpandClick,
  onVideoOnboardingClick,
  block,
  indices,
  groupId,
  isHovering
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
    <SlideFade
      in={isHovering}
      style={{
        position: 'absolute',
        left: 'auto',
        right: 0,
        top: '-50px',
        bottom: 'auto',
        zIndex: 3,
      }}
      unmountOnExit
    >
      <ButtonGroup
        isAttached={true}
        variant="outline"
        size="sm"
        bg="bg.dark"
        borderRadius="md"
        borderWidth="1px"
        shadow="md"
      >
        <IconButton
          icon={<PlayIcon />}
          borderRightWidth="1px"
          borderRightRadius="none"
          aria-label={'Preview bot from this block'}
          variant="ghost"
          onClick={handlePlayClick}
        />
        <IconButton
          icon={<CopyIcon />}
          borderRightWidth="1px"
          borderRightRadius="none"
          borderLeftRadius="none"
          aria-label={'Duplicate block'}
          variant="ghost"
          onClick={handleDuplicateClick}
        />
        <IconButton
          icon={<TrashIcon />}
          borderRightWidth="1px"
          borderRightRadius="none"
          borderLeftRadius="none"
          aria-label={'Delete block'}
          variant="ghost"
          onClick={handleDeleteClick}
        />
        <IconButton
          icon={<ExpandIcon />}
          borderRightWidth="1px"
          borderRightRadius="none"
          borderLeftRadius="none"
          aria-label={'Expand settings'}
          variant="ghost"
          onClick={onExpandClick}
        />
        {helpDocUrl && (
          <Button
            as={Link}
            leftIcon={<BuoyIcon />}
            borderLeftRadius="none"
            borderRightRadius={isVideoOnboardingItemDisplayed ? 0 : undefined}
            borderRightWidth={isVideoOnboardingItemDisplayed ? '1px' : undefined}

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

            borderLeftRadius="none"
          />
        )}
      </ButtonGroup>
    </SlideFade>
  )
}
