import { useBot } from '@/features/editor/providers/BotProvider'
import { OrderedList, ListItem, Code, Stack, Text } from '@chakra-ui/react'
import { BubbleProps } from '@urbiport/nextjs'
import { useState } from 'react'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import { parseDefaultBubbleTheme } from '../../Javascript/instructions/JavascriptBubbleInstructions'
import { JavascriptBubbleSnippet } from '../../Javascript/JavascriptBubbleSnippet'
import { ModalProps } from '../../../EmbedButton'

export const WixBubbleInstructions = ({ publicId, apiHost }: ModalProps) => {
  const { bot } = useBot()

  const [theme, setTheme] = useState<BubbleProps['theme']>(parseDefaultBubbleTheme(bot))
  const [previewMessage, setPreviewMessage] = useState<BubbleProps['previewMessage']>()

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        Go to <Code>Settings</Code> in your dashboard on Wix
      </ListItem>
      <ListItem>
        Click on <Code>Custom Code</Code> under <Code>Advanced</Code>
      </ListItem>
      <ListItem>
        Click <Code>+ Add Custom Code</Code> at the top right.
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
          <Text> Paste this snippet in the code box:</Text>
          <JavascriptBubbleSnippet theme={theme} previewMessage={previewMessage} publicId={publicId} apiHost={apiHost} />
        </Stack>
      </ListItem>
      <ListItem>
        Select &quot;Body - start&quot; under <Code>Place Code in</Code>
      </ListItem>
      <ListItem>Click Apply</ListItem>
    </OrderedList>
  )
}
