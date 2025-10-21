import React from 'react'
import { FormControl, Select } from '@urbiport/ui'
import { RowsFilterComparison } from '@quickbot.io/schemas'
import { ComparisonOperators } from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { InputTextWithVariables } from '@/components/inputs'
import { TableListItemProps } from '@/components/TableList'

export const RowsFilterComparisonItem = ({
  item,
  columns,
  onItemChange,
}: TableListItemProps<RowsFilterComparison> & { columns: string[] }) => {
  const handleColumnSelect = (column: string | number) => {
    if (typeof column !== 'string') return
    onItemChange({ ...item, column })
  }

  const handleSelectComparisonOperator = (comparisonOperator: ComparisonOperators) => {
    onItemChange({ ...item, comparisonOperator })
  }

  const handleChangeValue = (value: string) => {
    if (value === item.value) return
    onItemChange({ ...item, value })
  }

  return (
    <FormControl
      borderColor="divider.light"
      borderWidth="1px"
      borderRadius="md"
      p={4}
    >
      <Select
        selectedItem={item.column}
        onSelect={handleColumnSelect}
        items={columns}
        placeholder="Select a column"
      />
      <Select<ComparisonOperators>
        selectedItem={item.comparisonOperator}
        onSelect={handleSelectComparisonOperator}
        items={Object.values(ComparisonOperators)}
        placeholder="Select an operator"
      />
      {item.comparisonOperator !== ComparisonOperators.IS_SET &&
        item.comparisonOperator !== ComparisonOperators.IS_EMPTY && (
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={item.value ?? ''}
            onChange={handleChangeValue}
            placeholder="Type a value..."
          />
        )}
    </FormControl>
  )
}
