import { Popover, PopoverTrigger, PopoverContent, Button, chakra, Portal } from '@chakra-ui/react'
import { ShareIcon } from '@urbiport/icons'
import React from 'react'
import { InvitePopoverContent } from './InvitePopoverContent'
import { useTranslate } from '@tolgee/react'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { useEditor } from '@/features/editor/providers/EditorProvider'

export const InviteBotButton = ({ isLoading }: { isLoading: boolean }) => {
  const { t } = useTranslate()
  const { setPreviewingBlock } = useGraph()
  const { setShowPreviewDrawer } = useEditor()

  const handlePreviewClick = async () => {
    setPreviewingBlock(undefined)
    setShowPreviewDrawer(false)
  }

  return (
    <Popover isLazy placement="bottom-end">
      <PopoverTrigger>
        <Button
          onClick={handlePreviewClick}
          isLoading={isLoading}
          leftIcon={<ShareIcon />}
          aria-label={t('share.button.popover.ariaLabel')}
          size="sm"
          iconSpacing={{ base: 0, xl: 2 }}
        >
          <chakra.span display={{ base: 'none', xl: 'inline' }}>
            {t('invite.button.label')}
          </chakra.span>
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <InvitePopoverContent />
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
