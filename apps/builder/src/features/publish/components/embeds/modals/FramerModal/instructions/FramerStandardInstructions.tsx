import { OrderedList, ListItem, Code, Stack, Text } from '@chakra-ui/react'
import { JavascriptStandardSnippet } from '../../Javascript/JavascriptStandardSnippet'
import { ModalProps } from '../../../EmbedButton'

export const FramerStandardInstructions = (props: ModalProps) => (
  <OrderedList spacing={4} pl={5}>
    <ListItem>
      Press <Code>A</Code> to open the <Code>Add elements</Code> panel
    </ListItem>
    <ListItem>
      <Stack spacing={4}>
        <Text>
          Add an <Code>Embed</Code> element from the <Code>components</Code> section and paste this
          code:
        </Text>
        <JavascriptStandardSnippet {...props} />
      </Stack>
    </ListItem>
  </OrderedList>
)
