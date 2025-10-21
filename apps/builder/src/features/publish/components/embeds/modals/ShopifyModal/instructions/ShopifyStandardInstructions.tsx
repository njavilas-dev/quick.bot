import { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { OrderedList, ListItem, Stack, Code } from '@chakra-ui/react'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { StandardSettings } from '../../../settings/StandardSettings'
import {
  parseStandardElementCode,
  parseStandardHeadCode,
} from '../../Javascript/JavascriptStandardSnippet'
import { ModalProps } from '../../../EmbedButton'

export const ShopifyStandardInstructions = ({ publicId, apiHost }: ModalProps) => {
  const { t } = useTranslate()
  const [windowSizes, setWindowSizes] = useState<{
    width?: string
    height: string
  }>({
    height: '100%',
    width: '100%',
  })

  const headCode = parseStandardHeadCode(publicId, apiHost)

  const elementCode = parseStandardElementCode(windowSizes.width, windowSizes.height)

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        {t('blocks.integrations.shopifyStandardInstructions.editCode')} <Code>Themes</Code>{' '}
        {t('blocks.integrations.shopifyStandardInstructions.actionsEditCode')}{' '}
        <Code>Actions {'>'} Edit code</Code>
      </ListItem>
      <ListItem>
        <FormControl
          label={
            <>
              {t('blocks.integrations.shopifyStandardInstructions.pasteCodeHead')}{' '}
              <Code>Layout {'>'} theme.liquid</Code>{' '}
              {t('blocks.integrations.shopifyStandardInstructions.beforeClosingHead')}{' '}
              <Code>{'<head>'}</Code>:
            </>
          }
        >
          <CodeEditorWithVariables
            defaultValue={headCode}
            lang="html"
            isReadOnly
          />
        </FormControl>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <StandardSettings
            windowSettings={windowSizes}
            onUpdateWindowSettings={setWindowSizes}
          />
          <FormControl
            label={
              <>
                {t('blocks.integrations.shopifyStandardInstructions.placeElementBody')}{' '}
                <Code>{'<body>'}</Code>:
              </>
            }
          >
            <CodeEditorWithVariables
              defaultValue={elementCode}
              lang="html"
              isReadOnly
            />
          </FormControl>
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
