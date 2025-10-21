import React from 'react'
import { Stack } from '@chakra-ui/react'
import { HttpRequest, HttpRequestBlock } from '@quickbot.io/schemas'
import { InputTextWithVariables } from '@/components/inputs'
import { HttpRequestAdvancedConfigForm } from './HttpRequestAdvancedConfigForm'
import { FormControl } from '@urbiport/ui'

type Props = {
  block: HttpRequestBlock
  onOptionsChange: (options: HttpRequestBlock['options']) => void
}

export const HttpRequestSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const setLocalWebhook = async (newLocalWebhook: HttpRequest) => {
    onOptionsChange({ ...options, webhook: newLocalWebhook })
  }

  const updateUrl = (url: string) => {
    onOptionsChange({ ...options, webhook: { ...options?.webhook, url } })
  }

  return (
    <Stack spacing={6}>
      <FormControl>
        <InputTextWithVariables
          withVariableButton={true}
          placeholder="Paste URL..."
          defaultValue={options?.webhook?.url}
          onChange={updateUrl}
        />
      </FormControl>
      <HttpRequestAdvancedConfigForm
        blockId={blockId}
        webhook={options?.webhook}
        options={options}
        onWebhookChange={setLocalWebhook}
        onOptionsChange={onOptionsChange}
      />
    </Stack>
  )
}
