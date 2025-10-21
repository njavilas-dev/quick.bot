import { useState } from 'react'
import { Stack, Code, Text } from '@chakra-ui/react'
import { BubbleProps } from '@urbiport/nextjs'
import { Bot } from '@quickbot.io/schemas'
import { useBot } from '@/features/editor/providers/BotProvider'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import { JavascriptBubbleSnippet } from '../JavascriptBubbleSnippet'
import { defaultButtonsBackgroundColor } from '@quickbot.io/schemas/features/bot/theme/constants'
import { ModalProps } from '../../../EmbedButton'

export const parseDefaultBubbleTheme = (bot?: Bot) => ({
  button: {
    backgroundColor: bot?.theme.chat?.buttons?.backgroundColor ?? defaultButtonsBackgroundColor,
  },
})

export const JavascriptBubbleInstructions = ({ publicId, apiHost }: ModalProps) => {
  const { bot } = useBot()
  const [theme, setTheme] = useState<BubbleProps['theme']>(parseDefaultBubbleTheme(bot))
  const [previewMessage, setPreviewMessage] = useState<BubbleProps['previewMessage']>()

  return (
    <Stack spacing={4}>
      <BubbleSettings
        theme={theme}
        previewMessage={previewMessage}
        defaultPreviewMessageAvatar={bot?.theme.chat?.hostAvatar?.url ?? ''}
        onThemeChange={setTheme}
        onPreviewMessageChange={setPreviewMessage}
      />
      <Text>
        Paste this anywhere in the <Code>{'<body>'}</Code>:
      </Text>
      <JavascriptBubbleSnippet theme={theme} previewMessage={previewMessage} publicId={publicId} apiHost={apiHost} />
    </Stack>
  )
}
