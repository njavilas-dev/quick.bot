import { Button, MenuItem, HStack, Text, MenuDivider, Spinner } from '@chakra-ui/react'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu } from '@urbiport/ui'
import {
  type ConversionFilterType,
  conversionFilterValues,
  conversionFilterLabels
} from '../constants'

interface ConversionFilterSelectProps {
  value: ConversionFilterType | string
  onChange: (value: ConversionFilterType | string) => void
  showLabel?: boolean
  variableOption?: {
    id: string
    name: string
  }
  isLoading?: boolean
}

export const ConversionFilterSelect = ({
  value,
  onChange,
  showLabel = true,
  variableOption,
  isLoading = false
}: ConversionFilterSelectProps) => {

  const isVariableSelected = variableOption && value === `variable:${variableOption.id}`
  // Only show spinner when the variable is actually selected in THIS filter
  const showSpinner = isLoading && isVariableSelected
  const currentLabel = isVariableSelected
    ? `Collection Rate: ${variableOption.name}`
    : conversionFilterLabels[value as ConversionFilterType]

  if (showSpinner) {
    return (
      <HStack spacing={2}>
        {showLabel && <Text>Conversion</Text>}
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
        {variableOption && (
          <>
            <MenuDivider />
            <MenuItem
              key={`variable:${variableOption.id}`}
              onClick={() => onChange(`variable:${variableOption.id}`)}
            >
              Collection Rate: {variableOption.name}
            </MenuItem>
          </>
        )}
      </DropdownMenu>
    </HStack>
  )
}
