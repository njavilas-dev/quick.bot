import { useState } from 'react'
import { Stack, Code } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { StandardSettings } from '../../../settings/StandardSettings'
import { parseInitStandardCode } from '../../../snippetParsers/standard'
import { parseStandardElementCode } from '../../Javascript/JavascriptStandardSnippet'
import { parseInlineScript, botImportCode } from '../../../snippetParsers/shared'
import { ModalProps } from '../../../EmbedButton'

export const ScriptStandardInstructions = ({ publicId, apiHost }: ModalProps) => {
  const { t } = useTranslate()
  const [windowSizes, setWindowSizes] = useState<{
    height: string
    width?: string
  }>({
    height: '100%',
    width: '100%',
  })

  const standardElementSnippet = parseStandardElementCode(windowSizes.width, windowSizes.height)

  const scriptSnippet = parseInlineScript(`${botImportCode}
  
${parseInitStandardCode({
    bot: publicId,
    apiHost,
  })}`)

  return (
    <Stack spacing={4}>
      <StandardSettings windowSettings={windowSizes} onUpdateWindowSettings={setWindowSizes} />
      <FormControl
        label={
          <>
            {t('blocks.integrations.scriptStandardInstructions.makeSureElement')}{' '}
            <Code>quickbot-standard</Code>{' '}
            {t('blocks.integrations.scriptStandardInstructions.inBody')} <Code>{'<body>'}</Code>:
          </>
        }
      >
        <CodeEditorWithVariables isReadOnly defaultValue={standardElementSnippet} lang="html" />
      </FormControl>
      <FormControl label={t('blocks.integrations.scriptStandardInstructions.runScript')}>
        <CodeEditorWithVariables isReadOnly defaultValue={scriptSnippet} lang="javascript" />
      </FormControl>
    </Stack>
  )
}
