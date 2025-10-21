import React from 'react'
import { Switch as SwitchOriginal, SwitchProps } from '@chakra-ui/react'

export type SwitchWithLabelProps = {
  defaultValue: boolean | undefined
  onChange?: (isChecked: boolean) => void
  boxPadding?: number
  boxMargin?: number
  withBorders?: boolean
  isVisible?: boolean
} & Omit<SwitchProps, 'value' | 'onChange' | 'justifyContent' | 'defaultValue' | 'isChecked'>

export const Switch = ({
  defaultValue,
  onChange,
  ...switchProps
}: SwitchWithLabelProps) => {

  const isChecked = defaultValue ?? false

  const handleChange = () => {
    if (onChange) onChange(!isChecked)
  }

  return (
    <SwitchOriginal
      isChecked={isChecked}
      onChange={handleChange}
      {...switchProps}
    />
  )
}
