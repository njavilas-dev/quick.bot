import { useState } from 'react'
import { ListItem, OrderedList, Stack } from '@chakra-ui/react'
import { H4 } from '@urbiport/ui'
import { StandardSettings } from '../../../settings/StandardSettings'
import { InstallNextjsPackageSnippet } from '../InstallNextjsPackageSnippet'
import { NextjsStandardSnippet } from '../NextjsStandardSnippet'
import { ModalProps } from '../../../EmbedButton'

export const NextjsStandardInstructions = ({ publicId }: ModalProps) => {
  const [windowSizes, setWindowSizes] = useState<{
    height: string
    width?: string
  }>({
    height: '100%',
    width: '100%',
  })

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        <Stack spacing={4}>
          <H4>Install the packages</H4>
          <InstallNextjsPackageSnippet />
        </Stack>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <StandardSettings
            windowSettings={windowSizes}
            onUpdateWindowSettings={setWindowSizes}
          />
          <NextjsStandardSnippet {...windowSizes} publicId={publicId} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
