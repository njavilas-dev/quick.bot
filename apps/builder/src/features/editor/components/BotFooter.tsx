import React, { useState } from 'react'
import Link from 'next/link'
import { Flex, HStack, Button, IconButton, Tooltip, chakra } from '@chakra-ui/react'
import { CopyIcon, MinusIcon, PlayIcon, PlusIcon, RedoIcon, UndoIcon } from '@urbiport/icons'
import { isNotDefined } from '@quickbot.io/lib'
import { useDebouncedCallback } from 'use-debounce'
import { InviteBotButton } from '@/features/invitations/components/InviteBotButton'
import { PublishButton } from '@/features/publish/components/PublishButton'
import { HORIZONTAL_MENU_HEIGHT, SIDEBAR_WIDTH } from '@/features/editor/constants'
import { useEditor } from '../providers/EditorProvider'
import { useBot } from '../providers/BotProvider'
import { useTranslate } from '@tolgee/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSidebarSlide } from '@urbiport/ui'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { useUser } from '@/hooks/useUser'
import { LoopWarningButton } from '@/features/graph/components/LoopWarningButton'
import { useGraphZoom } from '@/features/graph/providers/GraphZoomProvider'
import { useRouter } from 'next/router'

export const BotFooter = () => {

  const router = useRouter()
  const isIframe = router.asPath.endsWith('/iframe')
  const { zoomMethods, currentZoom, maxZoom, minZoom } = useGraphZoom()
  const { isExtended } = useSidebarSlide()
  const { t } = useTranslate()
  const { user } = useUser()

  const { bot, canUndo, canRedo, undo, redo, save, currentUserMode, isSavingLoading } = useBot()

  const [isRedoShortcutTooltipOpen, setRedoShortcutTooltipOpen] = useState(false)

  const [isUndoShortcutTooltipOpen, setUndoShortcutTooltipOpen] = useState(false)

  const hideUndoShortcutTooltipLater = useDebouncedCallback(() => {
    setUndoShortcutTooltipOpen(false)
  }, 1000)

  const hideRedoShortcutTooltipLater = useDebouncedCallback(() => {
    setRedoShortcutTooltipOpen(false)
  }, 1000)

  const isLoading = isNotDefined(bot)
  const isGuest = currentUserMode === 'guest'
  const canInvite = currentUserMode === 'write' || currentUserMode === 'read'

  useKeyboardShortcuts({
    undo: () => {
      if (!canUndo) return
      hideUndoShortcutTooltipLater.flush()
      setUndoShortcutTooltipOpen(true)
      hideUndoShortcutTooltipLater()
      undo()
    },
    redo: () => {
      if (!canRedo) return
      hideUndoShortcutTooltipLater.flush()
      setRedoShortcutTooltipOpen(true)
      hideRedoShortcutTooltipLater()
      redo()
    },
  })
  const { setPreviewingBlock } = useGraph()
  const {
    showPreviewDrawer,
    setShowPreviewDrawer,
    setStartPreviewAtGroup,
    setStartPreviewAtEvent,
  } = useEditor()

  const handlePreviewClick = async () => {
    if (showPreviewDrawer) {
      setPreviewingBlock(undefined)
      setShowPreviewDrawer(false)
    } else {
      setStartPreviewAtGroup(undefined)
      setStartPreviewAtEvent(undefined)
      await save()
      setShowPreviewDrawer(true)
    }
  }

  return (
    <Flex
      w={`calc(100% - ${isExtended ? SIDEBAR_WIDTH : 0}px)`}
      transition="width 350ms cubic-bezier(0.075, 0.82, 0.165, 1) 0s"
      justify="center"
      align="center"
      h={`${HORIZONTAL_MENU_HEIGHT}px`}
      zIndex={2}
      pos="absolute"
      right={0}
      bottom={0}
      left="auto"
      flexShrink={0}
      justifyContent="space-between"
      px={6}
      py={3}
    >
      <HStack justify="center" align="center" spacing="6">
        <HStack alignItems="center" spacing={3}>
          {currentUserMode === 'write' && <LoopWarningButton />}
          <IconButton
            icon={<MinusIcon />}
            aria-label={'Zoom out'}
            size="sm"
            variant={'squared:secondary'}
            onClick={() => zoomMethods?.zoomOut()}
            isDisabled={currentZoom <= minZoom}
          />
          <chakra.span fontSize="sm" color="gray.600" fontWeight="medium" minW="45px" textAlign="center">
            {Math.round(currentZoom * 100)}%
          </chakra.span>
          <IconButton
            icon={<PlusIcon />}
            aria-label={'Zoom in'}
            size="sm"
            variant={'squared:secondary'}
            onClick={() => zoomMethods?.zoomIn()}
            isDisabled={currentZoom >= maxZoom}
          />
          {currentUserMode === 'write' && (
            <HStack>
              <Tooltip
                label={
                  isUndoShortcutTooltipOpen
                    ? t('editor.header.undo.tooltip.label')
                    : t('editor.header.undoButton.label')
                }
                isOpen={isUndoShortcutTooltipOpen ? true : undefined}
                hasArrow={isUndoShortcutTooltipOpen}
              >
                <IconButton
                  display={['none', 'flex']}
                  variant={'squared:secondary'}
                  icon={<UndoIcon />}
                  size="sm"
                  aria-label={t('editor.header.undoButton.label')}
                  onClick={undo}
                  isDisabled={!canUndo}
                />
              </Tooltip>

              <Tooltip
                label={
                  isRedoShortcutTooltipOpen
                    ? t('editor.header.undo.tooltip.label')
                    : t('editor.header.redoButton.label')
                }
                isOpen={isRedoShortcutTooltipOpen ? true : undefined}
                hasArrow={isRedoShortcutTooltipOpen}
              >
                <IconButton
                  display={['none', 'flex']}
                  icon={<RedoIcon />}
                  size="sm"
                  variant={'squared:secondary'}
                  aria-label={t('editor.header.redoButton.label')}
                  onClick={redo}
                  isDisabled={!canRedo}
                />
              </Tooltip>
            </HStack>
          )}
        </HStack>
      </HStack>

      <HStack>
        {!isIframe && (
          <>
            <Button
              aria-label="Preview bot flow"
              onClick={handlePreviewClick}
              isLoading={isLoading || isSavingLoading}
              leftIcon={<PlayIcon />}
              size="sm"
              iconSpacing={{ base: 0, xl: 2 }}
            >
              <chakra.span display={{ base: 'none', xl: 'inline' }}>
                {t('editor.header.previewButton.label')}
              </chakra.span>
            </Button>

            {canInvite && (
              <Flex pos="relative">
                <InviteBotButton isLoading={isLoading} />
              </Flex>
            )}
          </>
        )}

        {isGuest && (
          <Button
            as={Link}
            href={
              !user
                ? {
                  pathname: '/signup',
                  query: {
                    redirectPath: `/bots/${bot?.id}/duplicate`,
                  },
                }
                : `/bots/${bot?.id}/duplicate`
            }
            leftIcon={<CopyIcon />}
            isLoading={isLoading}
            size="sm"
          >
            {t('editor.footer.duplicateButton.label')}
          </Button>
        )}

        {currentUserMode === 'write' && <PublishButton size="sm" />}
      </HStack>
    </Flex>
  )
}
