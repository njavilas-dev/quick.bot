import { Stack, Button, useDisclosure, Text, Tooltip } from '@chakra-ui/react'
import { ConfirmModal } from '@/components/ConfirmModal'
import React from 'react'
import { EditableBotIcon } from '@/components/EditableBotIcon'
import { BotIcon } from '@/components/BotIcon'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useWorkspaceRole } from '@/hooks/useWorkspaceRole'
import { useTranslate } from '@tolgee/react'
import { InputTextCopy, InputText } from '@urbiport/ui'
import { FormControl } from '@urbiport/ui'

export const WorkspaceSettingsForm = () => {
  const { t } = useTranslate()
  const { workspace, workspaces, updateCurrentWorkspace, deleteCurrentWorkspace } = useWorkspace()
  const { isAdmin } = useWorkspaceRole()

  const { onClose } = useDisclosure()

  const handleNameChange = (name: string) => {
    if (!workspace?.id || !isAdmin) return
    updateCurrentWorkspace({ name })
  }

  const handleChangeIcon = (icon: string) => {
    if (!isAdmin) return
    updateCurrentWorkspace({ icon })
  }

  const handleDeleteClick = async () => {
    await deleteCurrentWorkspace()
    onClose()
  }

  const itsUnique = workspaces.length <= 1

  return (
    <Stack key={workspace?.id} spacing="6" w="full">
      <FormControl label={t('workspace.settings.icon.title')} direction="row">
        {workspace && (
          <>
            {isAdmin ? (
              <EditableBotIcon
                uploadFileProps={{
                  workspaceId: workspace.id,
                  fileName: 'icon',
                }}
                icon={workspace.icon}
                onChange={handleChangeIcon}
                size="26px"
              />
            ) : (
              <Tooltip label="Only workspace admins can edit the workspace icon" hasArrow>
                <div>
                  <BotIcon icon={workspace.icon} size="26px" />
                </div>
              </Tooltip>
            )}
          </>
        )}
      </FormControl>
      {workspace && (
        <>
          <FormControl>
            <Tooltip
              label={!isAdmin ? 'Only workspace admins can edit the workspace name' : ''}
              hasArrow
            >
              <InputText
                key={workspace.id}
                placeholder={t('workspace.settings.name.label')}
                defaultValue={workspace?.name}
                onChange={handleNameChange}
                debounceTimeout={800}
                isDisabled={!isAdmin}
              />
            </Tooltip>
          </FormControl>
          <FormControl label="ID:" helperText="Used when interacting with the QuickBot API.">
            <InputTextCopy key={workspace.id} defaultValue={workspace.id} readOnly />
          </FormControl>
        </>
      )}
      {workspace && isAdmin && (
        <DeleteWorkspaceButton
          onConfirm={handleDeleteClick}
          workspaceName={workspace?.name}
          itsUnique={itsUnique}
        />
      )}
    </Stack>
  )
}

const DeleteWorkspaceButton = ({
  workspaceName,
  onConfirm,
  itsUnique = false,
}: {
  workspaceName: string
  onConfirm: () => Promise<void>
  itsUnique?: boolean
}) => {
  const { t } = useTranslate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button variant="outline:error" onClick={onOpen}>
        {t('workspace.settings.deleteButton.label')}
      </Button>
      <ConfirmModal
        hideConfirmButton={itsUnique ? true : false}
        isOpen={isOpen}
        onConfirm={onConfirm}
        onClose={onClose}
        onReject={onClose}
        message={
          <Text>
            {t(
              itsUnique
                ? 'workspace.settings.deleteButton.adviseMessage'
                : 'workspace.settings.deleteButton.confirmMessage',
              {
                workspaceName,
              },
            )}
          </Text>
        }
        confirmButtonLabel="Delete"
      />
    </>
  )
}
