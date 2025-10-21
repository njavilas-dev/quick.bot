import { Box, Stack, Table, Tbody, Text, Th, Thead, Tr } from '@chakra-ui/react'
import { trpc } from '@/lib/trpc'
import { useTranslate } from '@tolgee/react'
import { H2 } from '@urbiport/ui'
import { BillingPlanType, WorkspaceRole } from '@quickbot.io/prisma'
import { isDefined } from '@quickbot.io/lib'
import { useUser } from '@/hooks/useUser'
import { useWorkspace } from '@/hooks/useWorkspace'
import { TableSkeleton } from '@/components/TableSkeleton'
import { PremiumAlert } from '@/components/PremiumAlert'
import { deleteInvitationQuery } from '../queries/deleteInvitationQuery'
import { deleteMemberQuery } from '../queries/deleteMemberQuery'
import { updateInvitationQuery } from '../queries/updateInvitationQuery'
import { updateMemberQuery } from '../queries/updateMemberQuery'
import { AddMemberForm } from './AddMemberForm'
import { MemberItem } from './MemberItem'
import { useLoadingSave } from '@/hooks/useLoadingSave'

export const MembersList = () => {
  const { t } = useTranslate()
  const { user } = useUser()
  const { workspace, currentWorkspaceRole } = useWorkspace()
  const setLoadingSave = useLoadingSave()

  const {
    data,
    refetch: refetchMembers,
    isLoading,
  } = trpc.workspace.listWorkspaceMembers.useQuery(
    {
      workspaceId: workspace?.id,
    },
    {
      enabled: !!workspace?.id,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const members = data?.members ?? []
  const invitations = data?.invitations ?? []

  const canEdit = currentWorkspaceRole === WorkspaceRole.ADMIN

  const handleDeleteMemberClick = (memberId: string) => async () => {
    if (!workspace) return
    await deleteMemberQuery(workspace.id, memberId)
    setLoadingSave()
    await refetchMembers()
  }

  const handleSelectNewRole = (memberId: string) => async (role: WorkspaceRole) => {
    if (!workspace) return
    await updateMemberQuery(workspace.id, { userId: memberId, role })
    setLoadingSave()
    await refetchMembers()
  }

  const handleDeleteInvitationClick = (id: string) => async () => {
    if (!workspace) return
    await deleteInvitationQuery({ workspaceId: workspace.id, id })
    setLoadingSave()
    await refetchMembers()
  }

  const handleSelectNewInvitationRole = (id: string) => async (type: WorkspaceRole) => {
    if (!workspace) return
    await updateInvitationQuery({ workspaceId: workspace.id, id, type })
    setLoadingSave()
    await refetchMembers()
  }

  const handleNewInvitation = async () => {
    await refetchMembers()
  }

  const handleNewMember = async () => {
    await refetchMembers()
  }

  const currentMembersCount =
    members.filter((member) => member.role !== WorkspaceRole.GUEST).length + invitations.length

  const membersLimit = workspace?.billingPlan.membersLimit ?? 'inf'

  const canInviteNewMember =
    membersLimit === 'inf' ? true : membersLimit ? currentMembersCount < membersLimit : false

  return (
    <Stack w="full" spacing={3}>
      {!canInviteNewMember && (
        <PremiumAlert
          message={t('workspace.membersList.unlockBanner.label')}
          excludedPlans={[BillingPlanType.FREE]}
        />
      )}
      {isDefined(membersLimit) && (
        <Box display="flex" flexDirection="column" gap="8px">
          <H2>
            {t('workspace.membersList.title')}{' '}
            {membersLimit === -1 ? '' : `(${currentMembersCount}/${membersLimit})`}
          </H2>

          <Text fontSize="sm" color="text.light">
            Add or remove members from your workspace.
          </Text>
        </Box>
      )}
      {workspace?.id && canEdit && (
        <AddMemberForm
          workspaceId={workspace.id}
          onNewInvitation={handleNewInvitation}
          onNewMember={handleNewMember}
          isLoading={isLoading}
          isLocked={!canInviteNewMember}
        />
      )}
      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Invite Link</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {members.map((member) => (
            <MemberItem
              key={member.userId}
              email={member.user.email ?? ''}
              name={member.user.name ?? undefined}
              role={member.role}
              isMe={member.userId === user?.id}
              onDeleteClick={handleDeleteMemberClick(member.userId)}
              onSelectNewRole={handleSelectNewRole(member.userId)}
              canEdit={canEdit}
              workspaceId={workspace?.id}
            />
          ))}
          {invitations.map((invitation) => (
            <MemberItem
              key={invitation.email}
              email={invitation.email ?? ''}
              role={invitation.type}
              onDeleteClick={handleDeleteInvitationClick(invitation.id)}
              onSelectNewRole={handleSelectNewInvitationRole(invitation.id)}
              isPending
              canEdit={canEdit}
              workspaceId={workspace?.id}
            />
          ))}
          {isLoading && <TableSkeleton columns={6} />}
        </Tbody>
      </Table>
    </Stack>
  )
}
