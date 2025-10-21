import { Alert, AlertIcon, Button, Link, Stack, Text } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@urbiport/icons'
import { HttpRequest, HttpRequestBlock, ZapierBlock } from '@quickbot.io/schemas'
import React from 'react'
import { HttpRequestAdvancedConfigForm } from '../../webhook/components/HttpRequestAdvancedConfigForm'

type Props = {
  block: ZapierBlock
  onOptionsChange: (options: HttpRequestBlock['options']) => void
}

export const ZapierSettings = ({ block: { id: blockId, options }, onOptionsChange }: Props) => {
  const setLocalWebhook = async (newLocalWebhook: HttpRequest) => {
    onOptionsChange({
      ...options,
      webhook: newLocalWebhook,
    })
    return
  }

  const url = options?.webhook?.url

  return (
    <Stack spacing={6}>
      <Alert status={url ? 'success' : 'info'}>
        <AlertIcon />
        {url ? (
          <>Your zap is correctly configured 🚀</>
        ) : (
          <Stack>
            <Text>Head up to Zapier to configure this block:</Text>
            <Button
              as={Link}
              href="https://zapier.com/apps/bot/integrations"
              isExternal
              colorScheme="blue"
            >
              <Text mr="2">Zapier</Text> <ExternalLinkIcon />
            </Button>
          </Stack>
        )}
      </Alert>
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
