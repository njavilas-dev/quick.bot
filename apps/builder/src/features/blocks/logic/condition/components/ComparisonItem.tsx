import { Stack } from '@chakra-ui/react'
import { Comparison, Variable } from '@quickbot.io/schemas'
import { TableListItemProps } from '@/components/TableList'

import { InputTextWithVariables } from '@/components/inputs'
import { ComparisonOperators } from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { useTranslate } from '@tolgee/react'
import { FormControl, Select } from '@urbiport/ui'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'

export const ComparisonItem = ({ item, onItemChange }: TableListItemProps<Comparison>) => {
  const { t } = useTranslate()

  const handleSelectVariable = (variable?: Variable) => {
    if (variable?.id === item.variableId) return
    onItemChange({ ...item, variableId: variable?.id })
  }

  const handleSelectComparisonOperator = (comparisonOperator: ComparisonOperators) => {
    onItemChange({ ...item, comparisonOperator })
  }
  const handleChangeValue = (value: string) => {
    if (value === item.value) return
    onItemChange({ ...item, value })
  }

  return (
    <Stack p="4" borderRadius="md" flex="1" borderWidth="1px" borderColor="divider.light" spacing={3}>
      <FormControl>
        <VariablesDropdown initialVariableId={item.variableId} onSelect={handleSelectVariable} />
      </FormControl>
      <FormControl>
        <Select<ComparisonOperators>
          selectedItem={item.comparisonOperator}
          onSelect={handleSelectComparisonOperator}
          items={Object.values(ComparisonOperators)}
          placeholder={t(
            'blocks.inputs.button.buttonSettings.displayCondition.selectOperator.label',
          )}
        />
      </FormControl>
      {item.comparisonOperator !== ComparisonOperators.IS_SET &&
        item.comparisonOperator !== ComparisonOperators.IS_EMPTY && (
          <FormControl>
            <InputTextWithVariables
              withVariableButton={true}
              defaultValue={item.value ?? ''}
              onChange={handleChangeValue}
              placeholder={parseValuePlaceholder(item.comparisonOperator)}
            />
          </FormControl>
        )}
    </Stack>
  )
}

const parseValuePlaceholder = (operator: ComparisonOperators | undefined): string => {
  switch (operator) {
    case ComparisonOperators.NOT_EQUAL:
    case ComparisonOperators.EQUAL:
    case ComparisonOperators.CONTAINS:
    case ComparisonOperators.STARTS_WITH:
    case ComparisonOperators.ENDS_WITH:
    case ComparisonOperators.NOT_CONTAINS:
    case undefined:
      return 'Type a value...'
    case ComparisonOperators.LESS:
    case ComparisonOperators.GREATER:
      return 'Type a number...'
    case ComparisonOperators.IS_SET:
    case ComparisonOperators.IS_EMPTY:
      return ''
    case ComparisonOperators.MATCHES_REGEX:
    case ComparisonOperators.NOT_MATCH_REGEX:
      return '/^[0-9]+$/'
  }
}
