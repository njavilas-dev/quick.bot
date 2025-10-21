import { Stack } from '@chakra-ui/react'
import React from 'react'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { InputTextCopy } from '@urbiport/ui'
import { CollaborationList } from '@/features/collaboration/components/CollaborationList'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useTranslate } from '@tolgee/react'

export const InvitePopoverContent = () => {
  const { t } = useTranslate()
  const { bot, updateBot } = useBot()

  const currentUrl = `${window.location.origin}/bots/${bot?.id}/flow`

  const updateIsPublicShareEnabled = async (isEnabled: boolean) => {
    await updateBot({
      updates: {
        settings: {
          ...bot?.settings,
          publicShare: {
            ...bot?.settings.publicShare,
            isEnabled,
          },
        },
      },
      save: true,
    })
  }

  return (
    <Stack spacing={4}>
      <CollaborationList />
      <Stack p="4" borderTopWidth={1} borderColor="divider.lighter">
        <SwitchWithRelatedSettings
          label={t('share.button.popover.publicFlow.label')}
          defaultValue={bot?.settings.publicShare?.isEnabled ?? false}
          onChange={updateIsPublicShareEnabled}
        >
          <InputTextCopy isReadOnly defaultValue={currentUrl} />
        </SwitchWithRelatedSettings>
      </Stack>
    </Stack>
  )
}
