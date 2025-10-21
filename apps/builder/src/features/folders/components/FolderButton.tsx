import { WorkspaceDashboardFolder } from '@quickbot.io/prisma'
import {
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  MenuItem,
  useDisclosure,
  Text,
  VStack,
  IconButton,
  SkeletonText,
  SkeletonCircle,
  WrapItem,
} from '@chakra-ui/react'
import { FolderIcon, MoreVerticalIcon } from '@urbiport/icons'
import { ConfirmModal } from '@/components/ConfirmModal'
import { useBotDnd } from '../BotDndProvider'
import { useRouter } from 'next/router'
import React, { memo, useMemo } from 'react'
import { DropdownMenu, useToast } from '@urbiport/ui'
import { T, useTranslate } from '@tolgee/react'
import { trpc } from '@/lib/trpc'

type Props = {
  folder: WorkspaceDashboardFolder
  index: number
  onFolderDeleted: () => void
  onFolderRenamed: () => void
}

const FolderButton = ({ folder, index, onFolderDeleted, onFolderRenamed }: Props) => {
  const { t } = useTranslate()
  const router = useRouter()
  const { draggedBot, setMouseOverFolderId, mouseOverFolderId } = useBotDnd()
  const isBotOver = useMemo(
    () => draggedBot && mouseOverFolderId === folder.id,
    [draggedBot, folder.id, mouseOverFolderId],
  )
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { showToast } = useToast()

  const { mutate: deleteFolder } = trpc.folders.deleteFolder.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: onFolderDeleted,
  })

  const { mutate: updateFolder } = trpc.folders.updateFolder.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: onFolderRenamed,
  })

  const onRenameSubmit = async (newName: string) => {
    if (newName === '' || newName === folder.name) return
    updateFolder({
      workspaceId: folder.workspaceId,
      folderId: folder.id,
      folder: {
        name: newName,
      },
    })
  }

  const handleClick = () => {
    router.push(`/bots/folders/${folder.id}`)
  }

  const handleMouseEnter = () => setMouseOverFolderId(folder.id)
  const handleMouseLeave = () => setMouseOverFolderId(undefined)
  return (
    <Button
      as={WrapItem}
      style={{ width: '225px', height: '270px' }}
      paddingX={6}
      whiteSpace={'normal'}
      pos="relative"
      cursor="pointer"
      variant="outline"
      colorScheme={isBotOver || draggedBot ? 'blue' : 'gray'}
      borderWidth={isBotOver ? '2px' : '1px'}
      transition={'border-width 0.1s ease'}
      justifyContent="center"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <DropdownMenu
        placement="bottom-end"
        matchWidth={false}
        menuButtonProps={{
          as: IconButton,
          icon: <MoreVerticalIcon />,
          'aria-label': `Show ${folder.name} menu`,
          onClick: (e) => e.stopPropagation(),
          colorScheme: 'gray',
          variant: 'outline',
          size: 'sm',
          pos: 'absolute',
          top: '5',
          right: '5',
        }}
      >
        <MenuItem
          color="red"
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
        >
          {t('delete')}
        </MenuItem>
      </DropdownMenu>
      <VStack spacing="4">
        <FolderIcon fontSize={50} color="brand.blue" />
        <Editable
          defaultValue={folder.name === '' ? 'New folder' : folder.name}
          onClick={(e) => e.stopPropagation()}
          onSubmit={onRenameSubmit}
          startWithEditView={index === 0 && folder.name === ''}
        >
          <EditablePreview px="2" textAlign="center" />
          <EditableInput textAlign="center" />
        </Editable>
      </VStack>

      <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onReject={onClose}
        confirmButtonLabel={'Delete'}
        message={
          <Text>
            <T
              keyName="folders.folderButton.deleteConfirmationMessage"
              params={{
                strong: <strong>{folder.name}</strong>,
              }}
            />
          </Text>
        }
        title={`Delete ${folder.name}?`}
        onConfirm={() =>
          deleteFolder({
            workspaceId: folder.workspaceId,
            folderId: folder.id,
          })
        }
        confirmButtonColor="red"
      />
    </Button>
  )
}

export const ButtonSkeleton = () => (
  <Button
    as={VStack}
    style={{ width: '225px', height: '270px' }}
    paddingX={6}
    whiteSpace={'normal'}
    pos="relative"
    cursor="pointer"
    variant="outline"
  >
    <VStack spacing="6" w="full">
      <SkeletonCircle boxSize="45px" />
      <SkeletonText noOfLines={2} w="full" />
    </VStack>
  </Button>
)

export default memo(
  FolderButton,
  (prev, next) =>
    prev.folder.id === next.folder.id &&
    prev.index === next.index &&
    prev.folder.name === next.folder.name,
)
