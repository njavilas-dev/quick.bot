import { MenuItem, HStack, Text } from '@chakra-ui/react'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu, MoreInfoTooltip } from '@urbiport/ui'
import { Variable } from '@quickbot.io/schemas'

interface VariableFilterSelectProps {
  variables: Variable[]
  value?: string
  onChange: (variableId: string) => void
  showLabel?: boolean
}

export const VariableFilterSelect = ({
  variables,
  value,
  onChange,
}: VariableFilterSelectProps) => {
  // Filter out system and secret variables
  const selectableVariables = variables.filter(
    (v) => !v.isSystemVariable && !v.isSecretVariable
  )

  const selectedVariable = selectableVariables.find((v) => v.id === value)

  let menuButtonContent: React.ReactNode

  if (selectedVariable?.name) {
    menuButtonContent = selectedVariable?.name
  } else {
    menuButtonContent = 'No variables...'
  }

  return (
    <HStack spacing={2}>
      <HStack spacing={1}>
        <Text>Variable:</Text>
        <MoreInfoTooltip>
          Filter analytics data by a specific variable to track its collection rate and conversion metrics
        </MoreInfoTooltip>
      </HStack>
      <DropdownMenu
        placement="bottom-start"
        matchWidth={false}
        menuButton={menuButtonContent}
        menuButtonProps={{
          'aria-label': 'Select Variable',
          isLoading: false,
          rightIcon: <ChevronDownIcon />,
          size: 'sm',
          sx: {
            '& > span:first-of-type': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: '1',
              minWidth: '0',
            }
          }
        }}
      >
        {selectableVariables.map((variable) => (
          <MenuItem
            key={variable.id}
            onClick={() => onChange(variable.id)}
          >
            {variable.name}
          </MenuItem>
        ))}
      </DropdownMenu>
    </HStack>
  )
}
