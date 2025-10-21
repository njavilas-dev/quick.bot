import { useBot } from '@/features/editor/providers/BotProvider'
import { OrderedList, ListItem, Stack, Text, Code } from '@chakra-ui/react'
import { BubbleProps } from '@urbiport/nextjs'
import { useState } from 'react'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import { parseDefaultBubbleTheme } from '../../Javascript/instructions/JavascriptBubbleInstructions'
import { JavascriptBubbleSnippet } from '../../Javascript/JavascriptBubbleSnippet'
import { ModalProps } from '../../../EmbedButton'

export const ShopifyBubbleInstructions = ({ publicId, apiHost }: ModalProps) => {
  const { bot } = useBot()

  const [theme, setTheme] = useState<BubbleProps['theme']>(parseDefaultBubbleTheme(bot))
  const [previewMessage, setPreviewMessage] = useState<BubbleProps['previewMessage']>()

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        On your shop dashboard in the <Code>Themes</Code> page, click on{' '}
        <Code>Actions {'>'} Edit code</Code>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <BubbleSettings
            previewMessage={previewMessage}
            defaultPreviewMessageAvatar={bot?.theme.chat?.hostAvatar?.url ?? ''}
            theme={theme}
            onPreviewMessageChange={setPreviewMessage}
            onThemeChange={setTheme}
          />
          <Text>
            In <Code>Layout {'>'} theme.liquid</Code> file, paste this code just before the closing{' '}
            <Code>{'<head>'}</Code> tag:
          </Text>
          <JavascriptBubbleSnippet theme={theme} previewMessage={previewMessage} publicId={publicId} apiHost={apiHost} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
