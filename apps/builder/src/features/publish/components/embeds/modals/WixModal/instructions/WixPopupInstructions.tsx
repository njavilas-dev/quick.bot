import { useState } from 'react'
import { OrderedList, ListItem, Code, Stack, Text } from '@chakra-ui/react'
import { PopupSettings } from '../../../settings/PopupSettings'
import { JavascriptPopupSnippet } from '../../Javascript/JavascriptPopupSnippet'
import { ModalProps } from '../../../EmbedButton'

export const WixPopupInstructions = ({ publicId, apiHost }: ModalProps) => {
  const [inputValue, setInputValue] = useState<number>()

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        Go to <Code>Settings</Code> in your dashboard on Wix
      </ListItem>
      <ListItem>
        Click on <Code>Custom Code</Code> in the <Code>Advanced</Code> section
      </ListItem>
      <ListItem>
        Click <Code>+ Add Custom Code</Code> at the top right.
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <PopupSettings onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)} />
          <Text>Paste this snippet in the code box:</Text>
          <JavascriptPopupSnippet autoShowDelay={inputValue} publicId={publicId} apiHost={apiHost} />
        </Stack>
      </ListItem>
      <ListItem>
        Select &quot;Body - start&quot; under <Code>Place Code in</Code>
      </ListItem>
      <ListItem>Click Apply</ListItem>
    </OrderedList>
  )
}
