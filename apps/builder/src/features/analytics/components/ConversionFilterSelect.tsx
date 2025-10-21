import { Button, MenuItem, HStack, Text } from '@chakra-ui/react'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu } from '@urbiport/ui'
import {
  type ConversionFilterType,
  conversionFilterValues,
  conversionFilterLabels
} from '../constants'

interface ConversionFilterSelectProps {
  value: ConversionFilterType
  onChange: (value: ConversionFilterType) => void
  showLabel?: boolean
}

export const ConversionFilterSelect = ({
  value,
  onChange,
  showLabel = true
}: ConversionFilterSelectProps) => {
  const currentLabel = conversionFilterLabels[value]

  return (
    <HStack spacing={2}>
      {showLabel && <Text>Conversion</Text>}
      <DropdownMenu
        placement="bottom-start"
        matchWidth={false}
        menuButton={currentLabel}
        menuButtonProps={{
          as: Button,
          size: 'sm',
          rightIcon: <ChevronDownIcon />,
        }}
      >
        {conversionFilterValues.map((filterValue) => (
          <MenuItem
            key={filterValue}
            onClick={() => onChange(filterValue)}
          >
            {conversionFilterLabels[filterValue]}
          </MenuItem>
        ))}
      </DropdownMenu>
    </HStack>
  )
}
