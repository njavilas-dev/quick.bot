import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { ExternalLinkIcon } from '@urbiport/icons'
import { OrderedList, ListItem, Link, Stack, Code } from '@chakra-ui/react'
import { useState } from 'react'
import { StandardSettings } from '../../../settings/StandardSettings'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import { env } from '@quickbot.io/env'
import packageJson from '../../../../../../../../../../packages/embeds/js/package.json'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'

type Props = {
  publicId: string
}

export const WordpressStandardInstructions = ({ publicId }: Props) => {
  const { t } = useTranslate()
  const [windowSizes, setWindowSizes] = useState<{
    width?: string
    height: string
  }>({
    height: '100%',
    width: '100%',
  })

  const elementCode = parseWordpressShortcode({ ...windowSizes, publicId })

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        {t('blocks.integrations.wordpressStandardInstructions.installPlugin')}{' '}
        <Link href="https://wordpress.org/plugins/wp-whatsapp-chat/" isExternal color="brand.blue">
          {t('blocks.integrations.wordpressStandardInstructions.quickbotPlugin')}
          <ExternalLinkIcon mx="2px" />
        </Link>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <StandardSettings windowSettings={windowSizes} onUpdateWindowSettings={setWindowSizes} />
          <FormControl
            label={t('blocks.integrations.wordpressStandardInstructions.placeShortcode')}
            helperText={
              <>
                {t('blocks.integrations.wordpressStandardInstructions.note')} <Code>Shortcode</Code>{' '}
                {t('blocks.integrations.wordpressStandardInstructions.templatingSystem')}
              </>
            }
          >
            <CodeEditorWithVariables defaultValue={elementCode} lang="shell" isReadOnly />
          </FormControl>
        </Stack>
      </ListItem>
    </OrderedList>
  )
}

const parseWordpressShortcode = ({
  width,
  height,
  publicId,
}: {
  width?: string
  height?: string
  publicId: string
}) => {
  return `[quickbot quickbot="${publicId}"${
    isCloudProdInstance()
      ? ''
      : ` host="${env.NEXT_PUBLIC_VIEWER_URL[0]}" lib_version="${packageJson.version}"`
  }${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}]`
}
