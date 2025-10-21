import { MenuItem, Tag, IconButton, MenuDivider, Button, useClipboard, Tooltip } from '@chakra-ui/react'
import { WorkspaceRole } from '@quickbot.io/prisma'
import React from 'react'
import { useTranslate } from '@tolgee/react'
import { Tr, Td } from '@chakra-ui/react'
import { DropdownMenu } from '@urbiport/ui'
import { MoreVerticalIcon, CopyIcon, CheckIcon } from '@urbiport/icons'
import { getRoleLabel } from './AddMemberForm'

type Props = {
  image?: string
  name?: string
  email: string
  role: WorkspaceRole
  isPending?: boolean
  isMe?: boolean
  canEdit: boolean
  workspaceId?: string
  onDeleteClick: () => void
  onSelectNewRole: (role: WorkspaceRole) => void
}

export const MemberItem = ({
  email,
  name,
  role,
  isPending = false,
  isMe = false,
  canEdit,
  workspaceId,
  onDeleteClick,
  onSelectNewRole,
}: Props) => {
  const { t } = useTranslate()
  const inviteLink = workspaceId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/bots?workspaceId=${workspaceId}`
    : ''
  const { hasCopied, onCopy } = useClipboard(inviteLink)

  return (
    <Tr key={email}>
      <Td>{name}</Td>
      <Td>{email}</Td>
      <Td>
        <Tag data-testid="tag">{getRoleLabel(role)}</Tag>
      </Td>
      <Td>
        <Tag variant="gray" data-testid="tag">
          {isPending ? t('pending') : t('active')}
        </Tag>
      </Td>
      <Td>
        {isPending && workspaceId ? (
          <Tooltip label={hasCopied ? 'Copied!' : 'Copy invite link'} hasArrow>
            <Button
              size="xs"
              variant="outline"
              leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
              onClick={onCopy}
              colorScheme={hasCopied ? 'green' : 'gray'}
            >
              {hasCopied ? 'Copied' : 'Copy'}
            </Button>
          </Tooltip>
        ) : (
          <span>-</span>
        )}
      </Td>
      <Td>
        {!isMe && canEdit && (
          <TableMoreActionMenu onSelectNewRole={onSelectNewRole} onDeleteClick={onDeleteClick} />
        )}
      </Td>
    </Tr>
  )
}

type PropsTableMoreActionMenu = {
  onSelectNewRole: (role: WorkspaceRole) => void
  onDeleteClick: () => void
}

const TableMoreActionMenu = ({ onSelectNewRole, onDeleteClick }: PropsTableMoreActionMenu) => {
  const { t } = useTranslate()

  const handleAdminClick = () => onSelectNewRole(WorkspaceRole.ADMIN)
  const handleMemberClick = () => onSelectNewRole(WorkspaceRole.MEMBER)

  return (
    <DropdownMenu
      placement="bottom-end"
      matchWidth={false}
      menuButtonProps={{
        as: IconButton,
        variant: 'ghost',
        icon: <MoreVerticalIcon color="text.light" size="sm" />,
        size: 'sm',
        name: 'actions',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    // closeOnSelect={true}
    >
      <MenuItem onClick={handleAdminClick} color="text.normal">
        {getRoleLabel(WorkspaceRole.ADMIN)}
      </MenuItem>
      <MenuItem onClick={handleMemberClick}>
        {getRoleLabel(WorkspaceRole.MEMBER)}
      </MenuItem>
      <MenuDivider />
      <MenuItem color="alert.error.color" onClick={onDeleteClick}>
        {t('remove')}
      </MenuItem>
    </DropdownMenu>
  )
}
