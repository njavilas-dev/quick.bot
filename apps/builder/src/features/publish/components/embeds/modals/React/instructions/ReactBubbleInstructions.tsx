import { useState } from 'react'
import { ListItem, OrderedList, Stack } from '@chakra-ui/react'
import { BubbleProps } from '@urbiport/nextjs'
import { H4 } from '@urbiport/ui'
import { useBot } from '@/features/editor/providers/BotProvider'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import { InstallReactPackageSnippet } from '../InstallReactPackageSnippet'
import { ReactBubbleSnippet } from '../ReactBubbleSnippet'
import { parseDefaultBubbleTheme } from '../../Javascript/instructions/JavascriptBubbleInstructions'
import { ModalProps } from '../../../EmbedButton'

export const ReactBubbleInstructions = ({ publicId }: ModalProps) => {
  const { bot } = useBot()
  const [theme, setTheme] = useState<BubbleProps['theme']>(parseDefaultBubbleTheme(bot))
  const [previewMessage, setPreviewMessage] = useState<BubbleProps['previewMessage']>()

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        <Stack spacing={4}>
          <H4>Install the packages</H4>
          <InstallReactPackageSnippet />
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
          <ReactBubbleSnippet theme={theme} previewMessage={previewMessage} publicId={publicId} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
