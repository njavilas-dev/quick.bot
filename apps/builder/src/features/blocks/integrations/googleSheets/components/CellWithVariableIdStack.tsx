import { Stack } from '@chakra-ui/react'
import { ExtractingCell, Variable } from '@quickbot.io/schemas'
import { TableListItemProps } from '@/components/TableList'
import { FormControl, Select } from '@urbiport/ui'

import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'

export const CellWithVariableIdStack = ({
  item,
  onItemChange,
  columns,
}: TableListItemProps<ExtractingCell> & { columns: string[] }) => {
  const handleColumnSelect = (column: string | number) => {
    if (typeof column !== 'string') return
    onItemChange({ ...item, column })
  }

  const handleVariableIdChange = (variable?: Variable) => {
    if (item.variableId === variable?.id) return
    onItemChange({ ...item, variableId: variable?.id })
  }

  return (
    <Stack p="4" borderRadius="md" flex="1" borderWidth="1px">
      <FormControl>
        <Select
          withClear={false}
          selectedItem={item.column}
          onSelect={handleColumnSelect}
          items={columns}
          placeholder="Select a column"
        />
      </FormControl>
      <FormControl>
        <VariablesDropdown initialVariableId={item.variableId} onSelect={handleVariableIdChange} />
      </FormControl>
    </Stack>
  )
}
