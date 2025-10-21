import { HStack, Button, MenuItem } from '@chakra-ui/react'
import { ChevronDownIcon } from '@urbiport/icons'
import { WorkspaceRole } from '@quickbot.io/prisma'
import { FormEvent, useState } from 'react'
import { sendInvitationQuery } from '../queries/sendInvitationQuery'
import { useTranslate } from '@tolgee/react'
import { DropdownMenu, InputText } from '@urbiport/ui'

type Props = {
  workspaceId: string
  onNewMember: () => void
  onNewInvitation: () => void
  isLoading: boolean
  isLocked: boolean
}
export const AddMemberForm = ({
  workspaceId,
  onNewMember,
  onNewInvitation,
  isLoading,
  isLocked,
}: Props) => {
  const { t } = useTranslate()
  const [invitationEmail, setInvitationEmail] = useState('')
  const [invitationRole, setInvitationRole] = useState<WorkspaceRole>(WorkspaceRole.MEMBER)

  const [isSendingInvitation, setIsSendingInvitation] = useState(false)

  const handleInvitationSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSendingInvitation(true)
    const { data } = await sendInvitationQuery({
      email: invitationEmail,
      type: invitationRole,
      workspaceId,
    })
    if (data?.member) onNewMember()
    if (data?.invitation) onNewInvitation()
    setInvitationEmail('')
    setIsSendingInvitation(false)
  }

  return (
    <HStack as="form" onSubmit={handleInvitationSubmit}>
      <InputText
        placeholder={t('workspace.membersList.inviteInput.placeholder')}
        name="inviteEmail"
        defaultValue={invitationEmail}
        onChange={setInvitationEmail}
        isDisabled={isLocked}
      />

      {!isLocked && <WorkspaceRoleMenuButton role={invitationRole} onChange={setInvitationRole} />}
      <Button
        colorScheme={'blue'}
        isLoading={isSendingInvitation}
        flexShrink={0}
        type="submit"
        isDisabled={isLoading || isLocked || invitationEmail === ''}
      >
        {t('workspace.membersList.inviteButton.label')}
      </Button>
    </HStack>
  )
}

const WorkspaceRoleMenuButton = ({
  role,
  onChange,
}: {
  role: WorkspaceRole
  onChange: (role: WorkspaceRole) => void
}) => {
  return (
    <DropdownMenu
      placement="bottom-end"
      usePortal={false}
      menuButton={getRoleLabel(role)}
      menuButtonProps={{
        flexShrink: 0,
        rightIcon: <ChevronDownIcon />,
      }}
    >
      <MenuItem onClick={() => onChange(WorkspaceRole.ADMIN)}>
        {getRoleLabel(WorkspaceRole.ADMIN)}
      </MenuItem>
      <MenuItem onClick={() => onChange(WorkspaceRole.MEMBER)}>
        {getRoleLabel(WorkspaceRole.MEMBER)}
      </MenuItem>
    </DropdownMenu>
  )
}



export const getRoleLabel = (role?: WorkspaceRole) => {
  switch (role) {
    case WorkspaceRole.ADMIN:
      return 'Admin'
    case WorkspaceRole.MEMBER:
      return 'Member'
    case WorkspaceRole.GUEST:
      return 'Guest'
    default:
      return ''
  }
}