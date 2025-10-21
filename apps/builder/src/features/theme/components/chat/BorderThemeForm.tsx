import React from 'react'
import { Stack } from '@chakra-ui/react'
import { ContainerBorderTheme } from '@quickbot.io/schemas'
import { InputColor, FormControl, InputNumber, ButtonSwitch } from '@urbiport/ui'
import { isDefined } from '@quickbot.io/lib'
import {
  borderRoundness,
  borderRoundnessValues,
} from '@quickbot.io/schemas/features/bot/theme/constants'

const BorderThemeForm = ({
  border,
  defaultBorder,
  onBorderChange,
}: {
  border: ContainerBorderTheme | undefined
  defaultBorder: ContainerBorderTheme | undefined
  onBorderChange: (border: ContainerBorderTheme) => void
}) => {
  const updateRoundness = (roundeness: (typeof borderRoundnessValues)[number]) => {
    onBorderChange({ ...border, roundeness })
  }

  const updateCustomRoundeness = (customRoundeness: number | undefined) => {
    onBorderChange({ ...border, customRoundeness })
  }

  const handleBorderChange = (value: string) => {
    updateRoundness(value as (typeof borderRoundnessValues)[number])
    updateCustomRoundeness(value === 'custom' ? 10 : undefined)
  }

  const updateThickness = (thickness?: number | string) => {
    if (typeof thickness === 'string') return
    if (!isDefined(thickness)) return
    onBorderChange({ ...border, thickness })
  }

  const updateColor = (color: string | undefined) => {
    onBorderChange({ ...border, color })
  }

  const thickness = border?.thickness ?? defaultBorder?.thickness ?? 0

  return (
    <Stack spacing={3}>
      <FormControl label="Color:" direction="row">
        <InputColor
          defaultValue={border?.color ? border?.color : (defaultBorder?.color as string)}
          onChange={updateColor}
        />
      </FormControl>
      <FormControl label="Thickness:" direction="row">
        <InputNumber width={160} suffix="px" defaultValue={thickness} onChange={updateThickness} />
      </FormControl>
      <FormControl label="Roundness:" direction="row">
        <ButtonSwitch
          items={borderRoundness}
          selectedItem={border?.roundeness ?? defaultBorder?.roundeness ?? 'none'}
          onSelect={handleBorderChange}
        />
      </FormControl>
    </Stack>
  )
}

export default BorderThemeForm
