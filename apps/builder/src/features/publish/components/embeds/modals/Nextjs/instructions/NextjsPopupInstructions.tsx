import { useState } from 'react'
import { ListItem, OrderedList, Stack } from '@chakra-ui/react'
import { H4 } from '@urbiport/ui'
import { PopupSettings } from '../../../settings/PopupSettings'
import { InstallNextjsPackageSnippet } from '../InstallNextjsPackageSnippet'
import { NextjsPopupSnippet } from '../NextjsPopupSnippet'
import { ModalProps } from '../../../EmbedButton'

export const NextjsPopupInstructions = ({ publicId }: ModalProps) => {
  const [inputValue, setInputValue] = useState<number>()

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
          <PopupSettings onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)} />
          <NextjsPopupSnippet autoShowDelay={inputValue} publicId={publicId} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
