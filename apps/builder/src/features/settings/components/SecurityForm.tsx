import { Stack } from '@chakra-ui/react'
import { Settings } from '@quickbot.io/schemas'
import React from 'react'
import { isDefined } from '@quickbot.io/lib'
import { env } from '@quickbot.io/env'
import { FormControl, InputTags } from '@urbiport/ui'
import { Control } from '@urbiport/ui'

type Props = {
  security: Settings['security']
  onUpdate: (security: Settings['security']) => void
}

export const SecurityForm = ({ security, onUpdate }: Props) => {
  const updateItems = (items: string[]) => {
    if (items.length === 0) onUpdate(undefined)
    onUpdate({
      allowedOrigins: items.filter(isDefined),
    })
  }

  return (
    <Stack spacing={3}>
      <Control
        label="Allowed origins"
        buttonTooltip="Restrict the execution of your bot to specific website origins. By default your bot can be executed on any website."
      >
        <FormControl label="Allowed origins">
          <InputTags
            items={security?.allowedOrigins}
            onChange={updateItems}
            placeholder={env.NEXT_PUBLIC_VIEWER_URL[0]}
          />
        </FormControl>
      </Control>
    </Stack>
  )
}
