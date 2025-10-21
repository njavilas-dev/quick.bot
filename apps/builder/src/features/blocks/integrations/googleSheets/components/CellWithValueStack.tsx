import { Cell as CellProps } from '@quickbot.io/schemas'
import { TableListItemProps } from '@/components/TableList'
import { InputTextWithVariables } from '@/components/inputs'
import { FormControl, Select } from '@urbiport/ui'

export const CellWithValueStack = ({
  item,
  onItemChange,
  columns,
}: TableListItemProps<CellProps> & { columns: string[] }) => {
  const handleColumnSelect = (column: string | number) => {
    if (typeof column !== 'string') return
    onItemChange({ ...item, column })
  }
  const handleValueChange = (value: string) => {
    if (item.value === value) return
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
        withClear={false}
        selectedItem={item.column}
        onSelect={handleColumnSelect}
        items={columns}
        placeholder="Select a column"
      />
      <InputTextWithVariables
        withVariableButton={true}
        defaultValue={item.value ?? ''}
        onChange={handleValueChange}
        placeholder="Type a value..."
      />
    </FormControl>
  )
}
