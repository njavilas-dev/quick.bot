import React, { ForwardedRef, forwardRef, ReactNode } from 'react'
import { Flex, useRadioGroup } from '@chakra-ui/react'
import { parseLabel, parseValue } from './helpers'
import { RadioCard } from '../radio-card'

type RadioButtonsProps<T extends string> = {
  options: readonly (T | { value: T; label: ReactNode })[]
  value?: T
  defaultValue?: T
  onSelect: (newValue: T) => string | void
}

export const RadioButtons = forwardRef(
  <T extends string>(
    { options, value, defaultValue, onSelect }: RadioButtonsProps<T>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const { getRootProps, getRadioProps } = useRadioGroup({
      value,
      defaultValue,
      onChange: onSelect,
    })

    const group = getRootProps()

    return (
      <Flex ref={ref} flexDirection="column" gap={2} {...group}>
        {options.map((item) => {
          const value = parseValue(item)
          const label = parseLabel(item)
          const radio = getRadioProps({ value })

          return (
            <RadioCard key={label?.toString()} {...radio}>
              {label}
            </RadioCard>
          )
        })}
      </Flex>
    )
  },
)

RadioButtons.displayName = 'RadioButtons'
