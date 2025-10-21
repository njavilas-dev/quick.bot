import { Avatar, HStack, MenuItem, Stack, Tag, Text } from '@chakra-ui/react'
import { CollaborationType } from '@quickbot.io/prisma'
import React from 'react'
import { useTranslate } from '@tolgee/react'
import { ReadableCollaborationType } from './ReadableCollaborationType'
import { DropdownMenu } from '@urbiport/ui'

type Props = {
  image?: string
  name?: string
  email: string
  type: CollaborationType
  isGuest?: boolean
  isOwner: boolean
  onDeleteClick: () => void
  onChangeCollaborationType: (type: CollaborationType) => void
}

export const CollaboratorItem = ({
  email,
  name,
  image,
  type,
  isGuest = false,
  isOwner,
  onDeleteClick,
  onChangeCollaborationType,
}: Props) => {
  const { t } = useTranslate()

  const handleEditClick = () => onChangeCollaborationType(CollaborationType.WRITE)
  const handleViewClick = () => onChangeCollaborationType(CollaborationType.READ)
  return (
    <DropdownMenu
      usePortal={false}
      menuButton={
        <CollaboratorIdentityContent
          email={email}
          name={name}
          image={image}
          isGuest={isGuest}
          type={type}
        />
      }
      menuButtonProps={{
        variant: 'unstyled',
      }}
    >
      {isOwner && (
        <>
          <MenuItem onClick={handleEditClick}>
            <ReadableCollaborationType type={CollaborationType.WRITE} />
          </MenuItem>
          <MenuItem onClick={handleViewClick}>
            <ReadableCollaborationType type={CollaborationType.READ} />
          </MenuItem>
          <MenuItem color="alert.error.color" onClick={onDeleteClick}>
            {t('remove')}
          </MenuItem>
        </>
      )}
    </DropdownMenu>
  )
}

const CollaboratorIdentityContent = ({
  name,
  type,
  isGuest = false,
  image,
  email,
}: {
  name?: string
  type: CollaborationType
  image?: string
  isGuest?: boolean
  email: string
}) => {
  const { t } = useTranslate()

  return (
    <HStack justifyContent="space-between" maxW="full" py="2" px="4">
      <HStack minW={0} spacing={3}>
        <Avatar name={name} src={image} size="xs" />
        <Stack spacing={0} minW="0">
          {name && <Text textAlign="left">{name}</Text>}
          <Text color="text.light" noOfLines={1}>
            {email}
          </Text>
        </Stack>
      </HStack>
      <HStack flexShrink={0}>
        {isGuest && <Tag variant={'gray'}>{t('pending')}</Tag>}
        <Tag>
          <ReadableCollaborationType type={type} />
        </Tag>
      </HStack>
    </HStack>
  )
}
