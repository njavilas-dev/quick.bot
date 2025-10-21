import { useState } from 'react'
import { BubbleProps } from '@urbiport/nextjs'
import { FormControl } from '@urbiport/ui'
import { ExternalLinkIcon } from '@urbiport/icons'
import { useTranslate } from '@tolgee/react'
import { OrderedList, ListItem, Link, Stack, Code } from '@chakra-ui/react'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import { useBot } from '@/features/editor/providers/BotProvider'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import { parseInitBubbleCode } from '../../../snippetParsers'
import { parseDefaultBubbleTheme } from '../../Javascript/instructions/JavascriptBubbleInstructions'
import packageJson from '../../../../../../../../../../packages/embeds/js/package.json'
import { ModalProps } from '../../../EmbedButton'

const botCloudLibraryVersion = '0.2'

export const WordpressBubbleInstructions = ({ publicId, apiHost }: ModalProps) => {
  const { t } = useTranslate()
  const { bot } = useBot()

  const [theme, setTheme] = useState<BubbleProps['theme']>(parseDefaultBubbleTheme(bot))
  const [previewMessage, setPreviewMessage] = useState<BubbleProps['previewMessage']>()

  const initCode = parseInitBubbleCode({
    bot: publicId,
    apiHost,
    theme: {
      ...theme,
      chatWindow: {
        backgroundColor: bot?.theme.general?.background?.content ?? '#fff',
      },
    },
    previewMessage,
  })

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        {t('blocks.integrations.wordpressBubbleInstructions.installPlugin')}{' '}
        <Link href="https://wordpress.org/plugins/wp-whatsapp-chat/" isExternal color="brand.blue">
          {t('blocks.integrations.wordpressBubbleInstructions.quickbotPlugin')}{' '}
          <ExternalLinkIcon mx="2px" />
        </Link>
      </ListItem>
      <ListItem>
        {t('blocks.integrations.wordpressBubbleInstructions.setLibraryVersion')}{' '}
        <Code>{isCloudProdInstance() ? botCloudLibraryVersion : packageJson.version}</Code>
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
          <FormControl label={t('blocks.integrations.wordpressBubbleInstructions.placeSnippet')}>
            <CodeEditorWithVariables defaultValue={initCode} lang="javascript" isReadOnly />
          </FormControl>
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
