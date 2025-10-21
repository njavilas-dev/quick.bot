import { MoreHorizontalIcon, EditIcon, TrashIcon } from '@urbiport/icons'
import { trpc } from '@/lib/trpc'
import { HStack, Flex, IconButton, MenuItem, Box, Text, Image, Divider } from '@chakra-ui/react'
import { Theme, ThemeTemplate } from '@quickbot.io/schemas'
import { useState } from 'react'
import { AvatarPlaceholder } from '../../../../../../../packages/embeds/js/src/components/avatars/AvatarPlaceholder'
import {
  defaultButtonsBackgroundColor,
  BackgroundType,
  defaultGuestAvatarIsEnabled,
  defaultGuestBubblesBackgroundColor,
  defaultHostAvatarIsEnabled,
  defaultBackgroundColor,
  defaultHostBubblesBackgroundColor,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { useTranslate } from '@tolgee/react'
import { BoxCard, DropdownMenu } from '@urbiport/ui'

export const ThemeTemplateCard = ({
  workspaceId,
  themeTemplate,
  isSelected,
  onClick,
  onRenameClick,
  onDeleteSuccess,
}: {
  workspaceId: string
  themeTemplate: Pick<ThemeTemplate, 'name' | 'theme' | 'id'>
  isSelected: boolean
  onRenameClick?: () => void
  onClick: () => void
  onDeleteSuccess?: () => void
}) => {
  const { t } = useTranslate()
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    theme: {
      listThemeTemplates: { refetch: refetchThemeTemplates },
    },
  } = trpc.useContext()
  const { mutate } = trpc.theme.deleteThemeTemplate.useMutation({
    onMutate: () => setIsDeleting(true),
    onSettled: () => setIsDeleting(false),
    onSuccess: () => {
      refetchThemeTemplates()
      if (onDeleteSuccess) onDeleteSuccess()
    },
  })

  const deleteThemeTemplate = () => {
    mutate({ themeTemplateId: themeTemplate.id, workspaceId })
  }

  const borderRadius =
    themeTemplate.theme.chat?.roundness === 'large'
      ? 'md'
      : themeTemplate.theme.chat?.roundness === 'none'
        ? 'none'
        : 'sm'

  const hostAvatar = {
    isEnabled: themeTemplate.theme.chat?.hostAvatar?.isEnabled ?? defaultHostAvatarIsEnabled,
    url: themeTemplate.theme.chat?.hostAvatar?.url,
  }

  const hostBubbleBgColor =
    themeTemplate.theme.chat?.hostBubbles?.backgroundColor ?? defaultHostBubblesBackgroundColor

  const guestAvatar = {
    isEnabled: themeTemplate.theme.chat?.guestAvatar?.isEnabled ?? defaultGuestAvatarIsEnabled,
    url: themeTemplate.theme.chat?.guestAvatar?.url,
  }

  const guestBubbleBgColor =
    themeTemplate.theme.chat?.guestBubbles?.backgroundColor ?? defaultGuestBubblesBackgroundColor

  const buttonBgColor =
    themeTemplate.theme.chat?.buttons?.backgroundColor ?? defaultButtonsBackgroundColor

  return (
    <BoxCard
      p={0}
      gap={0}
      cursor="pointer"
      onClick={onClick}
      opacity={isDeleting ? 0.5 : 1}
      pointerEvents={isDeleting ? 'none' : undefined}
      boxShadow={isSelected ? `'var(--chakra-colors-green-400)' 0 0 0 4px` : undefined}
    >
      <Box
        borderTopRadius="md"
        backgroundSize="cover"
        {...parseBackground(themeTemplate.theme.general?.background)}
        borderColor={isSelected ? 'brand.blue' : undefined}
      >
        <HStack mt="4" ml="4" spacing={0.5} alignItems="flex-end">
          <AvatarPreview avatar={hostAvatar} />
          <Box borderRadius="sm" w="80px" h="16px" background={hostBubbleBgColor} />
        </HStack>

        <HStack mt="1" mr="4" ml="auto" justifyContent="flex-end" alignItems="flex-end">
          <Box borderRadius="sm" w="80px" h="16px" background={guestBubbleBgColor} />
          <AvatarPreview avatar={guestAvatar} />
        </HStack>

        <HStack mt="1" ml="4" spacing={0.5} alignItems="flex-end">
          <AvatarPreview avatar={hostAvatar} />
          <Box borderRadius="sm" w="80px" h="16px" background={hostBubbleBgColor} />
        </HStack>
        <Flex mt="1" mb="4" pr="4" ml="auto" w="full" justifyContent="flex-end" gap="1">
          <Box borderRadius={borderRadius} w="20px" h="10px" background={buttonBgColor} />
          <Box borderRadius={borderRadius} w="20px" h="10px" background={buttonBgColor} />
          <Box borderRadius={borderRadius} w="20px" h="10px" background={buttonBgColor} />
        </Flex>
      </Box>
      <Divider />
      <HStack p="2" justifyContent="space-between">
        <Text fontSize="sm" noOfLines={1}>
          {themeTemplate.name}
        </Text>
        {onDeleteSuccess && onRenameClick && (
          <DropdownMenu
            placement="top-end"
            matchWidth={false}
            menuButtonProps={{
              justifyContent: 'center',
              as: IconButton,
              icon: <MoreHorizontalIcon />,
              'aria-label': t('theme.sideMenu.template.myTemplates.menu.ariaLabel'),
              variant: 'ghost',
              size: 'xs',
            }}
          >
            {isSelected && (
              <MenuItem icon={<EditIcon />} onClick={onRenameClick}>
                {t('rename')}
              </MenuItem>
            )}
            <MenuItem icon={<TrashIcon />} color="alert.error.color" onClick={deleteThemeTemplate}>
              {t('delete')}
            </MenuItem>
          </DropdownMenu>
        )}
      </HStack>
    </BoxCard>
  )
}

const parseBackground = (background: NonNullable<Theme['general']>['background']) => {
  switch (background?.type) {
    case undefined:
    case BackgroundType.COLOR:
      return {
        backgroundColor: background?.content ?? defaultBackgroundColor,
      }
    case BackgroundType.IMAGE:
      return { backgroundImage: `url(${background.content})` }
    case BackgroundType.NONE:
      return
  }
}

const AvatarPreview = ({ avatar }: { avatar: NonNullable<Theme['chat']>['hostAvatar'] }) => {
  const { t } = useTranslate()
  if (!avatar?.isEnabled) return null
  return avatar?.url ? (
    <Image
      src={avatar.url}
      alt={t('theme.sideMenu.template.gallery.avatarPreview.alt')}
      boxSize="12px"
      borderRadius="full"
    />
  ) : (
    <AvatarPlaceholder boxSize="12px" />
  )
}
