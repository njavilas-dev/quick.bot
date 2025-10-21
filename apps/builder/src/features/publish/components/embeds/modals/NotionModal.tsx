import { InputTextCopy } from '@urbiport/ui'
import {
  OrderedList,
  ListItem,
  Code,
  Text,
  Stack,
} from '@chakra-ui/react'
import { env } from '@quickbot.io/env'
import { ModalProps } from '../EmbedButton'

export const NotionModalContent = ({ publicId }: ModalProps): JSX.Element => {
  return (
    <>
      <OrderedList spacing={4}>
        <ListItem>
          Type <Code>/embed</Code>
        </ListItem>
        <ListItem>
          <Stack>
            <Text>Paste your bot URL</Text>
            <InputTextCopy
              isReadOnly
              defaultValue={`${env.NEXT_PUBLIC_VIEWER_URL[0]}/${publicId}`}
            />
          </Stack>
        </ListItem>
      </OrderedList>
    </>
  )
}