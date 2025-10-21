import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { useBot } from '@/features/editor/providers/BotProvider'
import { Stack } from '@chakra-ui/react'
import { BubbleProps } from '@urbiport/nextjs'
import { useState } from 'react'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import {
  parseInlineScript,
  parseInitBubbleCode,
  botImportCode,
} from '../../../snippetParsers'
import { parseDefaultBubbleTheme } from '../../Javascript/instructions/JavascriptBubbleInstructions'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { ModalProps } from '../../../EmbedButton'

export const ScriptBubbleInstructions = ({ publicId, apiHost }: ModalProps) => {
  const { t } = useTranslate()
  const { bot } = useBot()
  const [theme, setTheme] = useState<BubbleProps['theme']>(parseDefaultBubbleTheme(bot))
  const [previewMessage, setPreviewMessage] = useState<BubbleProps['previewMessage']>()

  const scriptSnippet = parseInlineScript(
    `${botImportCode}

${parseInitBubbleCode({
      bot: publicId,
      apiHost,
      theme,
      previewMessage,
    })}`,
  )

  return (
    <Stack spacing={4}>
      <BubbleSettings
        theme={theme}
        previewMessage={previewMessage}
        defaultPreviewMessageAvatar={bot?.theme.chat?.hostAvatar?.url ?? ''}
        onThemeChange={setTheme}
        onPreviewMessageChange={setPreviewMessage}
      />
      <FormControl label={t('blocks.integrations.scriptBubbleInstructions.initializeScript')}>
        <CodeEditorWithVariables isReadOnly defaultValue={scriptSnippet} lang="javascript" />
      </FormControl>
    </Stack>
  )
}
