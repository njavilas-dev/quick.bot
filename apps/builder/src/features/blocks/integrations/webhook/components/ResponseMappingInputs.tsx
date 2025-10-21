import { TableListItemProps } from '@/components/TableList'

import { Stack } from '@chakra-ui/react'
import { Variable, ResponseVariableMapping } from '@quickbot.io/schemas'
import { InputTextWithAutocomplete } from '@/components/inputs'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { FormControl } from '@urbiport/ui'

export const ResponseMappingInputs = ({
  item,
  onItemChange,
  dataItems,
}: TableListItemProps<ResponseVariableMapping> & { dataItems: string[] }) => {
  const handleBodyPathChange = (bodyPath: string) => onItemChange({ ...item, bodyPath })
  const handleVariableChange = (variable?: Variable) =>
    onItemChange({ ...item, variableId: variable?.id })

  return (
    <Stack p="4" borderRadius="md" flex="1" borderWidth="1px">
      <FormControl label="Data:">
        <InputTextWithAutocomplete
          items={dataItems}
          defaultValue={item.bodyPath}
          onChange={handleBodyPathChange}
          placeholder="Select the data"
          withVariableButton
        />
      </FormControl>
      <FormControl label="Set variable:">
        <VariablesDropdown onSelect={handleVariableChange} initialVariableId={item.variableId} />
      </FormControl>
    </Stack>
  )
}
