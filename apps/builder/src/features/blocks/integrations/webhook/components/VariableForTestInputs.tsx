import { InputTextWithVariables } from '@/components/inputs'
import { TableListItemProps } from '@/components/TableList'

import { Stack } from '@chakra-ui/react'
import { VariableForTest, Variable } from '@quickbot.io/schemas'
import { FormControl } from '@urbiport/ui'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'

export const VariableForTestInputs = ({
  item,
  onItemChange,
}: TableListItemProps<VariableForTest>) => {
  const handleVariableSelect = (variable?: Variable) =>
    onItemChange({ ...item, variableId: variable?.id })
  const handleValueChange = (value: string) => {
    if (value === item.value) return
    onItemChange({ ...item, value })
  }

  return (
    <Stack p="4" borderRadius="md" flex="1" borderWidth="1px">
      <FormControl label="Variable name:">
        <VariablesDropdown initialVariableId={item.variableId} onSelect={handleVariableSelect} />
      </FormControl>
      <FormControl label="Test value:">
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={item.value ?? ''}
          onChange={handleValueChange}
        />
      </FormControl>
    </Stack>
  )
}
