import { Button, MenuItem, HStack, Text, MenuDivider, Spinner } from '@chakra-ui/react'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu } from '@urbiport/ui'
import { statFilterValues, statFilterLabels } from '../constants'

interface StatFilterSelectProps {
  value: (typeof statFilterValues)[number] | string
  onChange: (value: (typeof statFilterValues)[number] | string) => void
  showLabel?: boolean
  variableOption?: {
    id: string
    name: string
  }
  isLoading?: boolean
}

export const StatFilterSelect = ({
  value,
  onChange,
  showLabel = true,
  variableOption,
  isLoading = false
}: StatFilterSelectProps) => {

  const isVariableSelected = variableOption && value === `variable:${variableOption.id}`
  // Only show spinner when the variable is actually selected in THIS filter
  const showSpinner = isLoading && isVariableSelected
  const currentLabel = isVariableSelected
    ? `Collected: ${variableOption.name}`
    : statFilterLabels[value as (typeof statFilterValues)[number]]

  if (showSpinner) {
    return (
      <HStack spacing={2}>
        {showLabel && <Text>Total</Text>}
        <Button
          size="sm"
          variant="outline"
          bg="bg.normal"
          rightIcon={<Spinner size="xs" />}
          isDisabled={true}
          cursor="not-allowed"
        >
          {currentLabel}
        </Button>
      </HStack>
    )
  }

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
        {variableOption && (
          <>
            <MenuDivider />
            <MenuItem
              key={`variable:${variableOption.id}`}
              onClick={() => onChange(`variable:${variableOption.id}`)}
            >
              Collected: {variableOption.name}
            </MenuItem>
          </>
        )}
      </DropdownMenu>
    </HStack>
  )
}
