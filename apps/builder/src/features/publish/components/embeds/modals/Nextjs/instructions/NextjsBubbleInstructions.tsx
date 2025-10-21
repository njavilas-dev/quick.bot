import { useBot } from '@/features/editor/providers/BotProvider'
import { ListItem, OrderedList, Stack } from '@chakra-ui/react'
import { BubbleProps } from '@urbiport/nextjs'
import { useState } from 'react'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import { InstallNextjsPackageSnippet } from '../InstallNextjsPackageSnippet'
import { NextjsBubbleSnippet } from '../NextjsBubbleSnippet'
import { parseDefaultBubbleTheme } from '../../Javascript/instructions/JavascriptBubbleInstructions'
import { H4 } from '@urbiport/ui'
import { ModalProps } from '../../../EmbedButton'

export const NextjsBubbleInstructions = ({ publicId }: ModalProps) => {
  const { bot } = useBot()
  const [theme, setTheme] = useState<BubbleProps['theme']>(parseDefaultBubbleTheme(bot))
  const [previewMessage, setPreviewMessage] = useState<BubbleProps['previewMessage']>()

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        <Stack spacing={4}>
          <H4>Install the packages</H4>
          <InstallNextjsPackageSnippet />
        </Stack>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <BubbleSettings
            theme={theme}
            previewMessage={previewMessage}
            defaultPreviewMessageAvatar={bot?.theme.chat?.hostAvatar?.url ?? ''}
            onThemeChange={setTheme}
            onPreviewMessageChange={setPreviewMessage}
          />
          <NextjsBubbleSnippet theme={theme} previewMessage={previewMessage} publicId={publicId} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
