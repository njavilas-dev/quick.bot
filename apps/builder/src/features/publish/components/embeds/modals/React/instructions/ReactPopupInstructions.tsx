import { ListItem, OrderedList, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { PopupSettings } from '../../../settings/PopupSettings'
import { InstallReactPackageSnippet } from '../InstallReactPackageSnippet'
import { ReactPopupSnippet } from '../ReactPopupSnippet'
import { H4 } from '@urbiport/ui'
import { ModalProps } from '../../../EmbedButton'

export const ReactPopupInstructions = ({ publicId }: ModalProps) => {
  const [inputValue, setInputValue] = useState<number>()

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
          <PopupSettings onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)} />
          <ReactPopupSnippet autoShowDelay={inputValue} publicId={publicId} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
