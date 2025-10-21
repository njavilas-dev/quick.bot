import { useState } from 'react'
import { OrderedList, ListItem, Code, Stack, Text } from '@chakra-ui/react'
import { TextLink } from '@/components/TextLink'
import { PopupSettings } from '../../../settings/PopupSettings'
import { JavascriptPopupSnippet } from '../../Javascript/JavascriptPopupSnippet'
import { ModalProps } from '../../../EmbedButton'

export const WebflowPopupInstructions = ({ publicId, apiHost }: ModalProps) => {
  const [inputValue, setInputValue] = useState<number>()

  return (
    <>
      <OrderedList spacing={4} pl={5}>
        <ListItem>
          Press <Code>A</Code> to open the <Code>Add elements</Code> panel
        </ListItem>
        <ListItem>
          <Stack spacing={4}>
            <PopupSettings onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)} />
            <Text>
              Add an <Code>Embed</Code> element from the <Code>components</Code> section and paste
              this code:
            </Text>
            <JavascriptPopupSnippet autoShowDelay={inputValue} publicId={publicId} apiHost={apiHost} />
          </Stack>
        </ListItem>
      </OrderedList>
      <Text fontSize="sm" color="text.light">
        Check out the{' '}
        <TextLink href="https://docs.quick.bot/builder/deploy/client#popup" isExternal>
          Webflow embed documentation
        </TextLink>{' '}
        for more options.
      </Text>
    </>
  )
}
