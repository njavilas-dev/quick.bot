import { TableList } from '@/components/TableList'
import { GoogleSheetsGetOptions, RowsFilterComparison } from '@quickbot.io/schemas'
import React from 'react'
import { RowsFilterComparisonItem } from './RowsFilterComparisonItem'
import { LogicalOperator } from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { FormControl, Select } from '@urbiport/ui'

type Props = {
  filter: GoogleSheetsGetOptions['filter']
  columns: string[]
  onFilterChange: (filter: GoogleSheetsGetOptions['filter']) => void
}

export const RowsFilterTableList = ({ filter, columns, onFilterChange }: Props) => {
  const updateComparisons = (comparisons: RowsFilterComparison[]) =>
    onFilterChange({
      ...filter,
      logicalOperator: filter?.logicalOperator ?? LogicalOperator.AND,
      comparisons,
    })

  const updateLogicalOperator = (logicalOperator: LogicalOperator) =>
    filter && onFilterChange({ ...filter, logicalOperator })

  return (
    <TableList<RowsFilterComparison>
      initialItems={filter?.comparisons ?? []}
      onItemsChange={updateComparisons}
      ComponentBetweenItems={() => (
        <FormControl>
          <Select<LogicalOperator>
            selectedItem={filter?.logicalOperator}
            onSelect={updateLogicalOperator}
            items={Object.values(LogicalOperator)}
          />
        </FormControl>
      )}
      addLabel="Add filter rule"
    >
      {(props) => <RowsFilterComparisonItem {...props} columns={columns} />}
    </TableList>
  )
}
