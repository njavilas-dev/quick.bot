import { OrderedList, ListItem, Code, Stack, Text } from '@chakra-ui/react'
import { JavascriptStandardSnippet } from '../../Javascript/JavascriptStandardSnippet'
import { ModalProps } from '../../../EmbedButton'

export const WixStandardInstructions = (props: ModalProps) => {
  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        In the Wix Website Editor:
        <Code>
          Add {'>'} Embed Code {'>'} Embed HTML
        </Code>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <Text>
            Click on <Code>Enter code</Code> and paste this code:
          </Text>
          <JavascriptStandardSnippet width="100%" height="100%" {...props} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
