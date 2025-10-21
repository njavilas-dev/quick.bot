import { useState } from 'react'
import { OrderedList, ListItem, Code, Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { StandardSettings } from '../../../settings/StandardSettings'
import {
  parseStandardElementCode,
  parseStandardHeadCode,
} from '../../Javascript/JavascriptStandardSnippet'
import { ModalProps } from '../../../EmbedButton'

export const GtmStandardInstructions = ({ publicId, apiHost }: ModalProps) => {
  const { t } = useTranslate()
  const [windowSizes, setWindowSizes] = useState<{
    height: string
    width?: string
  }>({
    height: '100%',
    width: '100%',
  })

  const headCode = parseStandardHeadCode(publicId, apiHost)

  const elementCode = parseStandardElementCode(windowSizes.width, windowSizes.height)

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        {t('blocks.integrations.gtmStandardInstructions.addNewTag')} <Code>Add a new tag</Code>
      </ListItem>
      <ListItem>
        {t('blocks.integrations.gtmStandardInstructions.chooseCustomHtmlTag')}{' '}
        <Code>Custom HTML tag</Code>
      </ListItem>
      <ListItem>
        {t('blocks.integrations.gtmStandardInstructions.checkSupportDocumentWrite')}{' '}
        <Code>Support document.write</Code>
      </ListItem>
      <ListItem>
        <FormControl label={t('blocks.integrations.gtmStandardInstructions.pasteCodeBelow')}>
          <CodeEditorWithVariables defaultValue={headCode} isReadOnly lang="html" />
        </FormControl>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <StandardSettings windowSettings={windowSizes} onUpdateWindowSettings={setWindowSizes} />
          <FormControl label={t('blocks.integrations.gtmStandardInstructions.addElementToPage')}>
            <CodeEditorWithVariables defaultValue={elementCode} isReadOnly lang="html" />
          </FormControl>
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
