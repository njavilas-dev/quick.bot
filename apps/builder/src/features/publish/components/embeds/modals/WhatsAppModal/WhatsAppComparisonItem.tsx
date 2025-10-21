import { TableListItemProps } from '@/components/TableList'
import { InputTextWithVariables } from '@/components/inputs'
import { WhatsAppComparison } from '@quickbot.io/schemas/features/whatsapp'
import { ComparisonOperators } from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { FormControl, Select } from '@urbiport/ui'

export const WhatsAppComparisonItem = ({
  item,
  onItemChange,
}: TableListItemProps<WhatsAppComparison>) => {
  const handleSelectComparisonOperator = (comparisonOperator: ComparisonOperators) => {
    if (comparisonOperator === item.comparisonOperator) return
    onItemChange({ ...item, comparisonOperator })
  }
  const handleChangeValue = (value: string) => {
    if (value === item.value) return
    onItemChange({ ...item, value })
  }

  return (
    <FormControl
      direction="row"
      label="User message"
      borderColor="divider.light"
      borderWidth="1px"
      borderRadius="md"
      p={4}
    >
      <Select<ComparisonOperators>
        selectedItem={item.comparisonOperator}
        onSelect={handleSelectComparisonOperator}
        items={Object.values(ComparisonOperators)}
        placeholder="Select an operator"
      />
      {item.comparisonOperator !== ComparisonOperators.IS_SET &&
        item.comparisonOperator !== ComparisonOperators.IS_EMPTY && (
          <InputTextWithVariables
            defaultValue={item.value ?? ''}
            onChange={handleChangeValue}
            placeholder={parseValuePlaceholder(item.comparisonOperator)}
          />
        )}
    </FormControl>
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
      return '^[0-9]+$'
  }
}
