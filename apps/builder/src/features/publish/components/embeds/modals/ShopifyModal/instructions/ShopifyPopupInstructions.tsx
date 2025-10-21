import { useState } from 'react'
import { OrderedList, ListItem, Stack, Text, Code } from '@chakra-ui/react'
import { PopupSettings } from '../../../settings/PopupSettings'
import { JavascriptPopupSnippet } from '../../Javascript/JavascriptPopupSnippet'
import { ModalProps } from '../../../EmbedButton'

export const ShopifyPopupInstructions = ({ publicId, apiHost }: ModalProps) => {
  const [inputValue, setInputValue] = useState<number>()

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        On your shop dashboard in the <Code>Themes</Code> page, click on{' '}
        <Code>Actions {'>'} Edit code</Code>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <PopupSettings onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)} />
          <Text>
            In <Code>Layout {'>'} theme.liquid</Code> file, paste this code just before the closing{' '}
            <Code>{'<head>'}</Code> tag:
          </Text>
          <JavascriptPopupSnippet autoShowDelay={inputValue} publicId={publicId} apiHost={apiHost} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
