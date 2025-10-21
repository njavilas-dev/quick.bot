import {
  Stack,
  HStack,
  Button,
  MenuItem,
  SkeletonCircle,
  Text,
  Tag,
  Flex,
  Skeleton,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu, InputText, useToast } from '@urbiport/ui'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useWorkspace } from '@/hooks/useWorkspace'
import { CollaborationType, WorkspaceRole } from '@quickbot.io/prisma'
import React, { FormEvent, useEffect, useState } from 'react'
import { CollaboratorItem } from './CollaboratorButton'
import { BotIcon } from '@/components/BotIcon'
import { updateInvitationQuery } from '../queries/updateInvitationQuery'
import { deleteInvitationQuery } from '../queries/deleteInvitationQuery'
import { updateCollaboratorQuery } from '../queries/updateCollaboratorQuery'
import { deleteCollaboratorQuery } from '../queries/deleteCollaboratorQuery'
import { sendInvitationQuery } from '../queries/sendInvitationQuery'
import { useTranslate } from '@tolgee/react'
import { ReadableCollaborationType } from './ReadableCollaborationType'
import { trpc } from '@/lib/trpc'
import { BotCollaborator } from '@quickbot.io/schemas/features/collaborators'
import { BotInvitation } from '@quickbot.io/schemas/features/invitations'

export const CollaborationList = () => {
  const { workspace, currentWorkspaceRole } = useWorkspace()
  const { t } = useTranslate()
  const { bot } = useBot()
  const [invitationType, setInvitationType] = useState<CollaborationType>(CollaborationType.READ)
  const [invitationEmail, setInvitationEmail] = useState('')
  const [isSendingInvitation, setIsSendingInvitation] = useState(false)

  const hasFullAccess =
    (currentWorkspaceRole && currentWorkspaceRole !== WorkspaceRole.GUEST) || false

  const { showToast } = useToast()

  const [collaborators, setCollaborators] = useState<BotCollaborator[]>([])

  const {
    data: collaboratorsData,
    isSuccess: isSuccessCollaborators,
    isLoading: isCollaboratorsLoading,
    refetch: refetchCollaborators,
  } = trpc.collaborators.getCollaborators.useQuery(
    {
      botId: bot!.id,
    },
    {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          title: t('share.button.popover.collaboratorsFetch.error.label'),
          description: error.message,
        })
      },
    },
  )

  useEffect(() => {
    if (isSuccessCollaborators && collaboratorsData) {
      setCollaborators(collaboratorsData.collaborators)
    }
  }, [isSuccessCollaborators, collaboratorsData])

  const [invitations, setInvitations] = useState<BotInvitation[]>([])

  const {
    data: invitationsData,
    isSuccess: isSuccessInvitations,
    isLoading: isInvitationsLoading,
    refetch: refetchInvitations,
  } = trpc.invitations.getInvitations.useQuery(
    {
      botId: bot!.id,
    },
    {
      enabled: !!bot?.id,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          title: t('share.button.popover.invitationsFetch.error.label'),
          description: error.message,
        })
      },
    },
  )

  useEffect(() => {
    if (isSuccessInvitations && invitationsData) {
      setInvitations(invitationsData.invitations)
    }
  }, [isSuccessInvitations, invitationsData])

  const handleChangeInvitationCollabType = (email: string) => async (type: CollaborationType) => {
    if (!bot || !hasFullAccess) return
    const { error } = await updateInvitationQuery(bot?.id, email, {
      email,
      botId: bot.id,
      type,
    })
    if (error)
      return showToast({
        detailsTitle: t('toast.details'),
        title: error.name,
        description: error.message,
      })
    refetchInvitations()
  }
  const handleDeleteInvitation = (email: string) => async () => {
    if (!bot || !hasFullAccess) return
    const { error } = await deleteInvitationQuery(bot?.id, email)
    if (error)
      return showToast({
        detailsTitle: t('toast.details'),
        title: error.name,
        description: error.message,
      })
    refetchInvitations()
  }

  const handleChangeCollaborationType = (userId: string) => async (type: CollaborationType) => {
    if (!bot || !hasFullAccess) return
    const { error } = await updateCollaboratorQuery(bot?.id, userId, {
      userId,
      type,
      botId: bot.id,
    })
    if (error)
      return showToast({
        detailsTitle: t('toast.details'),
        title: error.name,
        description: error.message,
      })
    refetchCollaborators()
  }
  const handleDeleteCollaboration = (userId: string) => async () => {
    if (!bot || !hasFullAccess) return
    const { error } = await deleteCollaboratorQuery(bot?.id, userId)
    if (error)
      return showToast({
        detailsTitle: t('toast.details'),
        title: error.name,
        description: error.message,
      })
    refetchCollaborators()
  }

  const handleInvitationSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!bot || !hasFullAccess) return
    setIsSendingInvitation(true)
    const { error } = await sendInvitationQuery(bot.id, {
      email: invitationEmail,
      type: invitationType,
    })
    setIsSendingInvitation(false)
    refetchInvitations()
    refetchCollaborators()
    if (error)
      return showToast({
        detailsTitle: t('toast.details'),
        title: error.name,
        description: error.message,
      })
    showToast({
      detailsTitle: t('toast.details'),
      status: 'success',
      title: t('share.button.popover.invitationSent.successToast.label'),
    })
    setInvitationEmail('')
  }

  const allowGuests = workspace?.billingPlan?.allowGuests || false

  return (
    <Stack spacing={1} pt="4">
      {allowGuests && (
        <HStack as="form" onSubmit={handleInvitationSubmit} px="4" pb="2">
          <InputText
            type="email"
            size="sm"
            placeholder={t('share.button.popover.inviteInput.placeholder')}
            name="inviteEmail"
            defaultValue={invitationEmail}
            onChange={setInvitationEmail}
            isDisabled={!hasFullAccess}
          />
          {hasFullAccess && (
            <CollaborationTypeMenuButton type={invitationType} onChange={setInvitationType} />
          )}
          <Button
            size="sm"
            colorScheme="blue"
            isLoading={isSendingInvitation}
            flexShrink={0}
            type="submit"
            isDisabled={!hasFullAccess || !invitationEmail}
          >
            {t('share.button.popover.inviteButton.label')}
          </Button>
        </HStack>
      )}
      {workspace && (
        <Flex py="2" px="4" justifyContent="space-between" alignItems="center">
          <HStack minW={0} spacing={3}>
            <BotIcon icon={workspace.icon} size="25px" />
            <Text fontSize="sm" noOfLines={1}>
              Everyone at {workspace.name}
            </Text>
          </HStack>
          <Tag flexShrink={0}>
            <ReadableCollaborationType type={CollaborationType.FULL_ACCESS} />
          </Tag>
        </Flex>
      )}
      {invitations?.map(({ email, type }) => (
        <CollaboratorItem
          key={email}
          email={email}
          type={type}
          isOwner={hasFullAccess}
          onDeleteClick={handleDeleteInvitation(email)}
          onChangeCollaborationType={handleChangeInvitationCollabType(email)}
          isGuest
        />
      ))}
      {collaborators?.map(({ user, type, userId }) => (
        <CollaboratorItem
          key={userId}
          email={user.email ?? ''}
          image={user.image ?? undefined}
          name={user.name ?? undefined}
          type={type}
          isOwner={hasFullAccess}
          onDeleteClick={handleDeleteCollaboration(userId ?? '')}
          onChangeCollaborationType={handleChangeCollaborationType(userId)}
        />
      ))}
      {(isCollaboratorsLoading || isInvitationsLoading) && (
        <HStack p="4" justifyContent="space-between">
          <HStack>
            <SkeletonCircle boxSize="32px" />
            <Stack>
              <Skeleton width="130px" h="6px" />
              <Skeleton width="200px" h="6px" />
            </Stack>
          </HStack>
          <Skeleton width="80px" h="10px" />
        </HStack>
      )}
    </Stack>
  )
}

const CollaborationTypeMenuButton = ({
  type,
  onChange,
}: {
  type: CollaborationType
  onChange: (type: CollaborationType) => void
}) => (
  <DropdownMenu
    usePortal={false}
    menuButton={<ReadableCollaborationType type={type} />}
    menuButtonProps={{
      size: 'sm',
      flexShrink: 0,
      rightIcon: <ChevronDownIcon />,
    }}
  >
    <MenuItem onClick={() => onChange(CollaborationType.READ)}>
      <ReadableCollaborationType type={CollaborationType.READ} />
    </MenuItem>
    <MenuItem onClick={() => onChange(CollaborationType.WRITE)}>
      <ReadableCollaborationType type={CollaborationType.WRITE} />
    </MenuItem>
  </DropdownMenu>
)
