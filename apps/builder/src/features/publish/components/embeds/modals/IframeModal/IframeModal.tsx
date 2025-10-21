import prettier from 'prettier/standalone'
import parserHtml from 'prettier/parser-html'
import { useState } from 'react'
import {
  Stack,
  OrderedList,
  ListItem,
} from '@chakra-ui/react'
import { H4, FormControl } from '@urbiport/ui'
import { env } from '@quickbot.io/env'
import { StandardSettings } from '../../settings/StandardSettings'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { ModalProps } from '../../EmbedButton'

export const IframeModalContent = ({ publicId }: ModalProps) => {
  const [windowSizes, setWindowSizes] = useState<{
    height: string
    width?: string
  }>({
    height: '100%',
    width: '100%',
  })

  const src = `${env.NEXT_PUBLIC_VIEWER_URL[0]}/${publicId}`

  const code = prettier.format(
    `<iframe src="${src}" style="border: none; width: ${windowSizes.width ?? '100%'}; height: ${windowSizes.height}"></iframe>`,
    { parser: 'html', plugins: [parserHtml] },
  )

  return (
    <>
      <OrderedList spacing={4} pl={5}>
        <ListItem>
          <StandardSettings
            windowSettings={windowSizes}
            onUpdateWindowSettings={setWindowSizes}
          />
        </ListItem>
        <ListItem>
          <Stack spacing={4}>
            <H4>Paste this anywhere in your HTML code:</H4>
            <FormControl>
              <CodeEditorWithVariables defaultValue={code} lang="html" isReadOnly />
            </FormControl>
          </Stack>
        </ListItem>
      </OrderedList>
    </>
  )
}
