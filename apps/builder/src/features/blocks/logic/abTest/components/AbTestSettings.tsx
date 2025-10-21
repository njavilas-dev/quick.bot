import { Stack } from '@chakra-ui/react'
import React from 'react'
import { isDefined } from '@quickbot.io/lib'
import { AbTestBlock } from '@quickbot.io/schemas'
import { InputNumberWithVariables } from '@/components/inputs'
import { defaultAbTestOptions } from '@quickbot.io/schemas/features/blocks/logic/abTest/constants'
import { FormControl } from '@urbiport/ui'

type Props = {
  options: AbTestBlock['options']
  onOptionsChange: (options: AbTestBlock['options']) => void
}

export const AbTestSettings = ({ options, onOptionsChange }: Props) => {
  const updateAPercent = (aPercent?: number) =>
    isDefined(aPercent) && onOptionsChange({ ...options, aPercent })

  return (
    <Stack spacing={6}>
      <FormControl label="Percent of users to follow A:" direction="column">
        <InputNumberWithVariables
          defaultValue={options?.aPercent ?? defaultAbTestOptions.aPercent}
          onChange={updateAPercent}
          max={100}
          min={0}
        />
      </FormControl>
    </Stack>
  )
}
