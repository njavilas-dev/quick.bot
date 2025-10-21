import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { ExternalLinkIcon } from '@urbiport/icons'
import { OrderedList, ListItem, Link, Stack, Code } from '@chakra-ui/react'
import { useState } from 'react'
import { PopupSettings } from '../../../settings/PopupSettings'
import { parseInitPopupCode } from '../../../snippetParsers/popup'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import packageJson from '../../../../../../../../../../packages/embeds/js/package.json'
import { FormControl } from '@urbiport/ui'

const botCloudLibraryVersion = '0.2'

type Props = {
  publicId: string
  apiHost: string
}
export const WordpressPopupInstructions = ({ publicId, apiHost }: Props) => {
  const [autoShowDelay, setAutoShowDelay] = useState<number>()

  const initCode = parseInitPopupCode({
    bot: publicId,
    apiHost,
    autoShowDelay,
  })

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        Install{' '}
        <Link href="https://wordpress.org/plugins/wp-whatsapp-chat/" isExternal color="brand.blue">
          the official QuickBot WordPress plugin
          <ExternalLinkIcon mx="2px" />
        </Link>
      </ListItem>
      <ListItem>
        Set <Code>Library version</Code> to{' '}
        <Code>{isCloudProdInstance() ? botCloudLibraryVersion : packageJson.version}</Code>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <PopupSettings
            onUpdateSettings={(settings) => setAutoShowDelay(settings.autoShowDelay)}
          />
          <FormControl
            label="You can now place the following code snippet in the QuickBot panel in your WordPress
            admin:"
          >
            <CodeEditorWithVariables defaultValue={initCode} lang="javascript" isReadOnly />
          </FormControl>
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
