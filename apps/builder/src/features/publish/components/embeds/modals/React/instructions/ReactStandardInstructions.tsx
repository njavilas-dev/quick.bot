import { ListItem, OrderedList, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { StandardSettings } from '../../../settings/StandardSettings'
import { InstallReactPackageSnippet } from '../InstallReactPackageSnippet'
import { ReactStandardSnippet } from '../ReactStandardSnippet'
import { H4 } from '@urbiport/ui'
import { ModalProps } from '../../../EmbedButton'

export const ReactStandardInstructions = ({ publicId }: ModalProps) => {
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
          <InstallReactPackageSnippet />
        </Stack>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <StandardSettings
            windowSettings={windowSizes}
            onUpdateWindowSettings={setWindowSizes}
          />
          <ReactStandardSnippet {...windowSizes} publicId={publicId} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
