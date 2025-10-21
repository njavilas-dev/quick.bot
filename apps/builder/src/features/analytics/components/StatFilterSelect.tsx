import { Button, MenuItem, HStack, Text } from '@chakra-ui/react'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu } from '@urbiport/ui'
import { statFilterValues, statFilterLabels } from '../constants'

interface StatFilterSelectProps {
  value: (typeof statFilterValues)[number]
  onChange: (value: (typeof statFilterValues)[number]) => void
  showLabel?: boolean
}

export const StatFilterSelect = ({
  value,
  onChange,
  showLabel = true
}: StatFilterSelectProps) => {

  const currentLabel = statFilterLabels[value]

  return (
    <HStack spacing={2}>
      {showLabel && <Text>Total</Text>}
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
        {statFilterValues.map((filterValue) => (
          <MenuItem
            key={filterValue}
            onClick={() => onChange(filterValue)}
          >
            {statFilterLabels[filterValue]}
          </MenuItem>
        ))}
      </DropdownMenu>
    </HStack>
  )
}
