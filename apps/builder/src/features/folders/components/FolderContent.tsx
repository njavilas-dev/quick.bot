import { WorkspaceDashboardFolder, WorkspaceRole } from '@quickbot.io/prisma'
import { Flex, HStack, Portal, Skeleton, Stack, useEventListener, Wrap } from '@chakra-ui/react'
import { useBotDnd } from '../BotDndProvider'
import React, { useEffect, useState } from 'react'
import { BackButton } from './BackButton'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useToast } from '@urbiport/ui'
import { CreateBotButton } from './CreateBotButton'
import { CreateFolderButton } from './CreateFolderButton'
import FolderButton, { ButtonSkeleton } from './FolderButton'
import BotButton from './BotButton'
import { BotCardOverlay } from './BotButtonOverlay'
import { useBots } from '@/hooks/useBots'
import { BotInDashboard } from '@/features/bot/types'
import { trpc } from '@/lib/trpc'
import { NodePosition } from '@/features/graph/providers/GraphDragAndDropProvider'
import { useTranslate } from '@tolgee/react'

type Props = { folder: WorkspaceDashboardFolder | null }

export const FolderContent = ({ folder }: Props) => {
  const { t } = useTranslate()

  const { workspace, currentWorkspaceRole } = useWorkspace()
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const { setDraggedBot, draggedBot, mouseOverFolderId, setMouseOverFolderId } = useBotDnd()
  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 })
  const [mousePositionInElement, setMousePositionInElement] = useState({
    x: 0,
    y: 0,
  })

  const { showToast } = useToast()

  const {
    data: { folders } = {},
    isLoading: isFolderLoading,
    refetch: refetchFolders,
  } = trpc.folders.listFolders.useQuery(
    {
      workspaceId: workspace?.id as string,
      parentFolderId: folder?.id,
    },
    {
      enabled: !!workspace,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          description: error.message,
        })
      },
    },
  )

  const { mutate: createFolder } = trpc.folders.createFolder.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: () => {
      refetchFolders()
    },
  })

  const { mutate: updateBot } = trpc.bot.updateBot.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: () => {
      refetchBots()
    },
  })

  const {
    bots,
    isLoading: isBotLoading,
    refetch: refetchBots,
  } = useBots({
    workspaceId: workspace?.id ?? '',
    folderId: folder === null ? 'root' : folder.id,
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
  })

  const moveBotToFolder = async (botId: string, folderId: string) => {
    if (!bots) return
    updateBot({
      botId,
      bot: {
        folderId: folderId === 'root' ? null : folderId,
      },
    })
  }

  const handleCreateFolder = () => {
    if (!folders || !workspace) return
    setIsCreatingFolder(true)
    createFolder({
      workspaceId: workspace.id,
      parentFolderId: folder?.id,
    })
    setIsCreatingFolder(false)
  }

  const handleMouseUp = async () => {
    if (mouseOverFolderId !== undefined && draggedBot)
      await moveBotToFolder(draggedBot.id, mouseOverFolderId ?? 'root')
    setMouseOverFolderId(undefined)
    setDraggedBot(undefined)
  }
  useEventListener(document, 'mouseup', handleMouseUp)

  const handleBotDrag =
    (bot: BotInDashboard) =>
      ({ absolute, relative }: NodePosition) => {
        if (draggedBot) return
        setMousePositionInElement(relative)
        setDraggablePosition({
          x: absolute.x - relative.x,
          y: absolute.y - relative.y,
        })
        setDraggedBot(bot)
      }

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedBot) return
    const { clientX, clientY } = e
    setDraggablePosition({
      x: clientX - mousePositionInElement.x,
      y: clientY - mousePositionInElement.y,
    })
  }
  useEventListener(document, 'mousemove', handleMouseMove)

  useEffect(() => {
    if (!draggablePosition || !draggedBot) return
    const { innerHeight } = window
    const scrollSpeed = 10
    const scrollMargin = 50
    const clientY = draggablePosition.y + mousePositionInElement.y
    const scrollY =
      clientY < scrollMargin ? -scrollSpeed : clientY > innerHeight - scrollMargin ? scrollSpeed : 0
    window.scrollBy(0, scrollY)
    const interval = setInterval(() => {
      window.scrollBy(0, scrollY)
    }, 5)

    return () => {
      clearInterval(interval)
    }
  }, [draggablePosition, draggedBot, mousePositionInElement])

  return (
    <Flex w="full" flex="1" justify="center">
      <Stack w="1000px" spacing={6} pt="4">
        <Skeleton isLoaded={folder?.name !== undefined}>{folder?.name}</Skeleton>
        <Stack>
          <HStack>
            {folder && <BackButton id={folder.parentFolderId} />}
            {currentWorkspaceRole !== WorkspaceRole.GUEST && (
              <CreateFolderButton
                onClick={handleCreateFolder}
                isLoading={isCreatingFolder || isFolderLoading}
              />
            )}
          </HStack>
          <Wrap spacing={4}>
            {currentWorkspaceRole !== WorkspaceRole.GUEST && (
              <CreateBotButton folderId={folder?.id} isLoading={isBotLoading} />
            )}
            {isFolderLoading && <ButtonSkeleton />}
            {folders &&
              folders.map((folder, index) => (
                <FolderButton
                  key={folder.id}
                  index={index}
                  folder={folder}
                  onFolderDeleted={refetchFolders}
                  onFolderRenamed={() => refetchFolders()}
                />
              ))}
            {isBotLoading && <ButtonSkeleton />}
            {bots &&
              bots.map((bot) => (
                <BotButton
                  key={bot.id}
                  bot={bot}
                  draggedBot={draggedBot}
                  onBotUpdated={refetchBots}
                  onDrag={handleBotDrag(bot)}
                />
              ))}
          </Wrap>
        </Stack>
      </Stack>
      {draggedBot && (
        <Portal>
          <BotCardOverlay
            bot={draggedBot}
            onMouseUp={handleMouseUp}
            pos="fixed"
            top="0"
            left="0"
            style={{
              transform: `translate(${draggablePosition.x}px, ${draggablePosition.y}px) rotate(-2deg)`,
            }}
            transformOrigin="0 0 0"
          />
        </Portal>
      )}
    </Flex>
  )
}
