import { useState } from 'react'
import { Stack, Code, Text } from '@chakra-ui/react'
import { StandardSettings } from '../../../settings/StandardSettings'
import { JavascriptStandardSnippet } from '../JavascriptStandardSnippet'
import { ModalProps } from '../../../EmbedButton'

export const JavascriptStandardInstructions = ({ publicId, apiHost }: ModalProps) => {
  const [windowSizes, setWindowSizes] = useState<{
    height: string
    width?: string
  }>({
    height: '100%',
    width: '100%',
  })

  return (
    <Stack spacing={4}>
      <StandardSettings
        windowSettings={windowSizes}
        onUpdateWindowSettings={setWindowSizes}
      />
      <Text>
        Paste this anywhere in the <Code>{'<body>'}</Code>:
      </Text>
      <JavascriptStandardSnippet {...windowSizes} publicId={publicId} apiHost={apiHost} />
    </Stack>
  )
}
