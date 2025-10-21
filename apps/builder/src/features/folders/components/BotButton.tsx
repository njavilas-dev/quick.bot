import React, { memo } from 'react'
import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  IconButton,
  MenuItem,
  Stack,
  Tag,
  Text,
  useDisclosure,
  VStack,
  WrapItem,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ConfirmModal } from '@/components/ConfirmModal'
import { MenuIcon } from '@urbiport/icons'
import { useDebounce } from 'use-debounce'
import { useToast } from '@urbiport/ui'
import { MoreButton } from './MoreButton'
import { BotIcon } from '@/components/BotIcon'
import { T, useTranslate } from '@tolgee/react'
import { BotInDashboard } from '@/features/bot/types'
import { isMobile } from '@/helpers/isMobile'
import { trpc, trpcVanilla } from '@/lib/trpc'
import { duplicateName } from '@/features/bot/helpers/duplicateName'
import { NodePosition, useDragDistance } from '@/features/graph/providers/GraphDragAndDropProvider'

type Props = {
  bot: BotInDashboard
  isReadOnly?: boolean
  draggedBot: BotInDashboard | undefined
  onBotUpdated: () => void
  onDrag: (position: NodePosition) => void
}

const BotButton = ({ bot, isReadOnly = false, draggedBot, onBotUpdated, onDrag }: Props) => {
  const { t } = useTranslate()
  const router = useRouter()
  const [draggedBotDebounced] = useDebounce(draggedBot, 200)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const buttonRef = React.useRef<HTMLDivElement>(null)

  useDragDistance({
    ref: buttonRef,
    onDrag,
    deps: [],
  })

  const { showToast } = useToast()

  const { mutate: importBot } = trpc.bot.importBot.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: ({ bot }) => {
      router.push(`/bots/${bot.id}/flow`)
    },
  })

  const { mutate: deleteBot } = trpc.bot.deleteBot.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: () => {
      onBotUpdated()
    },
  })

  const { mutate: unpublishBot } = trpc.bot.unpublishBot.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: () => {
      onBotUpdated()
    },
  })

  const handleBotClick = () => {
    if (draggedBotDebounced) return
    router.push(isMobile ? `/analytics/${bot.id}/answers` : `/bots/${bot.id}/flow`)
  }

  const handleDeleteBotClick = async () => {
    if (isReadOnly) return
    deleteBot({
      botId: bot.id,
    })
  }

  const handleDuplicateClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const { bot: botToDuplicate } = await trpcVanilla.bot.getBot.query({
      botId: bot.id,
    })
    if (!botToDuplicate) return
    importBot({
      workspaceId: botToDuplicate.workspaceId,
      bot: {
        ...botToDuplicate,
        name: duplicateName(botToDuplicate.name),
      },
    })
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteOpen()
  }

  const handleUnpublishClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!bot.publishedBotId) return
    unpublishBot({ botId: bot.id })
  }

  return (
    <Button
      ref={buttonRef}
      as={WrapItem}
      onClick={handleBotClick}
      display="flex"
      flexDir="column"
      variant="outline"
      w="225px"
      h="270px"
      borderRadius="lg"
      whiteSpace="normal"
      opacity={draggedBot ? 0.3 : 1}
      cursor="pointer"
    >
      {bot.publishedBotId && <Tag variant={'botButton'}>{t('folders.botButton.live')}</Tag>}
      {!isReadOnly && (
        <>
          <IconButton
            icon={<MenuIcon />}
            pos="absolute"
            top="20px"
            left="20px"
            aria-label="Drag"
            cursor="grab"
            variant="ghost"
            colorScheme="blue"
            size="sm"
          />
          <MoreButton
            pos="absolute"
            top="20px"
            right="20px"
            aria-label={t('folders.botButton.showMoreOptions')}
          >
            {bot.publishedBotId && (
              <MenuItem onClick={handleUnpublishClick}>{t('folders.botButton.unpublish')}</MenuItem>
            )}
            <MenuItem onClick={handleDuplicateClick}>{t('folders.botButton.duplicate')}</MenuItem>
            <MenuItem color="alert.error.color" onClick={handleDeleteClick}>
              {t('folders.botButton.delete')}
            </MenuItem>
          </MoreButton>
        </>
      )}
      <VStack spacing="4">
        <Flex borderRadius="full" justifyContent="center" alignItems="center" fontSize={'4xl'}>
          <BotIcon icon={bot.icon} size="lg" />
        </Flex>
        <Text textAlign="center" noOfLines={4} maxW="180px">
          {bot.name}
        </Text>
      </VStack>
      {!isReadOnly && (
        <ConfirmModal
          message={
            <Stack spacing="4">
              <Text>
                <T
                  keyName="folders.botButton.deleteConfirmationMessage"
                  params={{
                    strong: <strong>{bot.name}</strong>,
                  }}
                />
              </Text>
              <Alert status="warning">
                <AlertIcon />
                {t('folders.botButton.deleteConfirmationMessageWarning')}
              </Alert>
            </Stack>
          }
          confirmButtonLabel={t('delete')}
          onConfirm={handleDeleteBotClick}
          isOpen={isDeleteOpen}
          onReject={onDeleteClose}
          onClose={onDeleteClose}
        />
      )}
    </Button>
  )
}

export default memo(
  BotButton,
  (prev, next) =>
    prev.draggedBot?.id === next.draggedBot?.id &&
    prev.bot.id === next.bot.id &&
    prev.isReadOnly === next.isReadOnly &&
    prev.bot.name === next.bot.name &&
    prev.bot.icon === next.bot.icon &&
    prev.bot.publishedBotId === next.bot.publishedBotId,
)
