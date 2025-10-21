import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { InputTextWithVariables } from '@/components/inputs'
import { Select } from '@urbiport/ui'

import { Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { TextInputBlock, Variable } from '@quickbot.io/schemas'
import { fileVisibilityOptions } from '@quickbot.io/schemas/features/blocks/inputs/file/constants'
import { defaultTextInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/text/constants'
import React from 'react'
import { FormControl } from '@urbiport/ui'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { env } from '@quickbot.io/env'

type Props = {
  options: TextInputBlock['options']
  onOptionsChange: (options: TextInputBlock['options']) => void
}

export const TextInputBubbleForm = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()
  const updatePlaceholder = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })

  const updateButtonLabel = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })

  const updateVariableId = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

  const updateAttachmentsEnabled = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      attachments: { ...options?.attachments, isEnabled },
    })

  const updateAttachmentsSaveVariableId = (variable?: Pick<Variable, 'id'>) =>
    onOptionsChange({
      ...options,
      attachments: { ...options?.attachments, saveVariableId: variable?.id },
    })

  const updateVisibility = (visibility: (typeof fileVisibilityOptions)[number]) =>
    onOptionsChange({
      ...options,
      attachments: { ...options?.attachments, visibility },
    })

  const updateAudioClipEnabled = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      audioClip: { ...options?.audioClip, isEnabled },
    })

  const updateAudioClipSaveVariableId = (variable?: Pick<Variable, 'id'>) =>
    onOptionsChange({
      ...options,
      audioClip: { ...options?.audioClip, saveVariableId: variable?.id },
    })

  const updateAudioClipVisibility = (visibility: (typeof fileVisibilityOptions)[number]) =>
    onOptionsChange({
      ...options,
      audioClip: { ...options?.audioClip, visibility },
    })

  return (
    <Stack spacing={6}>
      <FormControl label={t('blocks.inputs.settings.placeholder.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.labels?.placeholder ?? defaultTextInputOptions.labels.placeholder}
          onChange={updatePlaceholder}
        />
      </FormControl>
      {env.NEXT_PUBLIC_BETA_ENV && (
        <FormControl label={t('blocks.inputs.settings.button.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={options?.labels?.button ?? defaultTextInputOptions.labels.button}
            onChange={updateButtonLabel}
          />
        </FormControl>
      )}
      {env.NEXT_PUBLIC_BETA_ENV && (
        <SwitchWithRelatedSettings
          label={'Allow audio clip'}
          defaultValue={options?.audioClip?.isEnabled ?? defaultTextInputOptions.audioClip.isEnabled}
          onChange={updateAudioClipEnabled}
        >
          <FormControl label="Save the URL in a variable:">
            <VariablesDropdown
              initialVariableId={options?.audioClip?.saveVariableId}
              onSelect={updateAudioClipSaveVariableId}
            />
          </FormControl>
          <FormControl
            label="Visibility:"
            moreInfoTooltip='This setting determines who can see the uploaded files. "Public" means that anyone who has the link can see the files. "Private" means that only a members of this workspace can see the files.'
          >
            <Select
              selectedItem={
                options?.audioClip?.visibility ?? defaultTextInputOptions.audioClip.visibility
              }
              onSelect={updateAudioClipVisibility}
              items={fileVisibilityOptions}
            />
          </FormControl>
        </SwitchWithRelatedSettings>
      )}
      {env.NEXT_PUBLIC_BETA_ENV && (
        <SwitchWithRelatedSettings
          label={'Allow attachments'}
          defaultValue={
            options?.attachments?.isEnabled ?? defaultTextInputOptions.attachments.isEnabled
          }
          onChange={updateAttachmentsEnabled}
        >
          <FormControl label="Save the URLs in a variable:">
            <VariablesDropdown
              initialVariableId={options?.attachments?.saveVariableId}
              onSelect={updateAttachmentsSaveVariableId}
            />
          </FormControl>
          <FormControl
            label="Visibility:"
            moreInfoTooltip='This setting determines who can see the uploaded files. "Public" means that anyone who has the link can see the files. "Private" means that only a members of this workspace can see the files.'
          >
            <Select
              selectedItem={
                options?.attachments?.visibility ?? defaultTextInputOptions.attachments.visibility
              }
              onSelect={updateVisibility}
              items={fileVisibilityOptions}
            />
          </FormControl>
        </SwitchWithRelatedSettings>
      )}
      <FormControl label={t('blocks.inputs.settings.saveAnswer.label')}>
        <VariablesDropdown initialVariableId={options?.variableId} onSelect={updateVariableId} />
      </FormControl>
    </Stack>
  )
}
