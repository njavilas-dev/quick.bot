import { useState } from 'react'
import { OrderedList, ListItem, Code, Stack, Text } from '@chakra-ui/react'
import { TextLink } from '@/components/TextLink'
import { PopupSettings } from '../../../settings/PopupSettings'
import { JavascriptPopupSnippet } from '../../Javascript/JavascriptPopupSnippet'
import { ModalProps } from '../../../EmbedButton'

export const FramerPopupInstructions = ({ publicId, apiHost }: ModalProps) => {
  const [inputValue, setInputValue] = useState<number>()

  return (
    <>
      <OrderedList spacing={4} pl={5}>
        <ListItem>
          Head over to the <Code>Site Settings</Code> {'>'} <Code>General</Code> {'>'}{' '}
          <Code>Custom Code</Code> section
        </ListItem>
        <ListItem>
          <Stack spacing={4}>
            <PopupSettings onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)} />
            <Text>
              Paste this in the{' '}
              <Code>
                End of {'<'}body{'>'} tag
              </Code>{' '}
              input:
            </Text>
            <JavascriptPopupSnippet autoShowDelay={inputValue} publicId={publicId} apiHost={apiHost} />
          </Stack>
        </ListItem>
      </OrderedList>
      <Text fontSize="sm" color="text.light">
        Check out the{' '}
        <TextLink href="https://www.framer.com/academy/lessons/custom-code" isExternal>
          Custom Code Framer doc
        </TextLink>{' '}
        for more information.
      </Text>
    </>
  )
}
