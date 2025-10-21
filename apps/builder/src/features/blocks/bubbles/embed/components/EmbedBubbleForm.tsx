import { InputTextWithVariables, InputNumberWithVariables } from '@/components/inputs'
import { EmbedBubbleBlock, Variable } from '@quickbot.io/schemas'
import { sanitizeUrl } from '@quickbot.io/lib'
import { useTranslate } from '@tolgee/react'
import { defaultEmbedBubbleContent } from '@quickbot.io/schemas/features/blocks/bubbles/embed/constants'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'

import { FormControl } from '@urbiport/ui'
import { Stack } from '@chakra-ui/react'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'

type Props = {
  content: EmbedBubbleBlock['content']
  onSubmit: (content: EmbedBubbleBlock['content']) => void
}

export const EmbedBubbleForm = ({ content, onSubmit }: Props) => {
  const { t } = useTranslate()

  const handleUrlChange = (url: string) => {
    const iframeUrl = sanitizeUrl(
      url.trim().startsWith('<iframe') ? extractUrlFromIframe(url) : url,
    )
    onSubmit({ ...content, url: iframeUrl })
  }

  const handleHeightChange = (value?: string | number) => {
    const height = typeof value === 'number' ? value : parseFloat(value ?? '')
    if (!isNaN(height)) {
      onSubmit({ ...content, height })
    }
  }

  const updateWaitEventName = (name: string) =>
    onSubmit({ ...content, waitForEvent: { ...content?.waitForEvent, name } })

  const updateWaitForEventEnabled = (isEnabled: boolean) =>
    onSubmit({
      ...content,
      waitForEvent: { ...content?.waitForEvent, isEnabled },
    })

  const updateSaveDataInVariableId = (variable?: Pick<Variable, 'id'>) =>
    onSubmit({
      ...content,
      waitForEvent: {
        ...content?.waitForEvent,
        saveDataInVariableId: variable?.id,
      },
    })

  return (
    <Stack spacing={6}>
      <FormControl helperText={t('editor.blocks.bubbles.embed.settings.worksWith.text')}>
        <InputTextWithVariables
          withVariableButton={true}
          placeholder={t('editor.blocks.bubbles.embed.settings.worksWith.placeholder')}
          defaultValue={content?.url ?? ''}
          onChange={handleUrlChange}
        />
      </FormControl>
      <FormControl
        label={t('editor.blocks.bubbles.embed.settings.numberInput.label')}
        direction="row"
      >
        <InputNumberWithVariables
          withVariableButton={true}
          defaultValue={content?.height ?? defaultEmbedBubbleContent.height}
          onChange={handleHeightChange}
          suffix={t('editor.blocks.bubbles.embed.settings.numberInput.unit')}
        />
      </FormControl>
      <SwitchWithRelatedSettings
        label={t('editor.blocks.bubbles.embed.settings.waitForEvent.label')}
        defaultValue={content?.waitForEvent?.isEnabled ?? false}
        onChange={updateWaitForEventEnabled}
      >
        <FormControl
          label={t('editor.blocks.bubbles.embed.settings.waitForEvent.nameLabel')}
          direction="row"
        >
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={content?.waitForEvent?.name}
            onChange={updateWaitEventName}
          />
        </FormControl>
        <FormControl label={t('editor.blocks.bubbles.embed.settings.waitForEvent.saveDataLabel')}>
          <VariablesDropdown
            onSelect={updateSaveDataInVariableId}
            initialVariableId={content?.waitForEvent?.saveDataInVariableId}
          />
        </FormControl>
      </SwitchWithRelatedSettings>
    </Stack>
  )
}

const extractUrlFromIframe = (iframe: string) => [...iframe.matchAll(/src="([^"]+)"/g)][0][1]
