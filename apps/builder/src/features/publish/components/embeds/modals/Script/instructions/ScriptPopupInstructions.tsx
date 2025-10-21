import { useState } from 'react'
import { Stack } from '@chakra-ui/react'
import { FormControl } from '@urbiport/ui'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { PopupSettings } from '../../../settings/PopupSettings'
import { parseInitPopupCode } from '../../../snippetParsers'
import { parseInlineScript, botImportCode } from '../../../snippetParsers/shared'
import { ModalProps } from '../../../EmbedButton'

export const ScriptPopupInstructions = ({ publicId, apiHost }: ModalProps) => {
  const [inputValue, setInputValue] = useState<number>()

  const scriptSnippet = parseInlineScript(
    `${botImportCode}

${parseInitPopupCode({
      bot: publicId,
      apiHost,
      autoShowDelay: inputValue,
    })}`,
  )

  return (
    <Stack spacing={4}>
      <PopupSettings onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)} />
      <FormControl label="Run this script to initialize the bot:">
        <CodeEditorWithVariables isReadOnly defaultValue={scriptSnippet} lang="javascript" />
      </FormControl>
    </Stack>
  )
}
