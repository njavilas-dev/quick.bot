import { useState } from 'react'
import { Stack, Code, Text } from '@chakra-ui/react'
import { PopupSettings } from '../../../settings/PopupSettings'
import { JavascriptPopupSnippet } from '../JavascriptPopupSnippet'
import { ModalProps } from '../../../EmbedButton'

export const JavascriptPopupInstructions = ({ publicId, apiHost }: ModalProps) => {
  const [inputValue, setInputValue] = useState<number>()

  return (
    <Stack spacing={4}>
      <PopupSettings onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)} />
      <Text>
        Paste this anywhere in the <Code>{'<body>'}</Code>:
      </Text>
      <JavascriptPopupSnippet autoShowDelay={inputValue} publicId={publicId} apiHost={apiHost} />
    </Stack>
  )
}
