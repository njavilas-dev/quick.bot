import { InputTextWithVariables } from '@/components/inputs'
import { TableListItemProps } from '@/components/TableList'
import { Stack } from '@chakra-ui/react'
import { KeyValue } from '@quickbot.io/schemas'
import { FormControl } from '@urbiport/ui'

export const QueryParamsInputs = (props: TableListItemProps<KeyValue>) => (
  <KeyValueInputs {...props} keyPlaceholder="e.g. email" valuePlaceholder="e.g. {{Email}}" />
)

export const HeadersInputs = (props: TableListItemProps<KeyValue>) => (
  <KeyValueInputs
    {...props}
    keyPlaceholder="e.g. Content-Type"
    valuePlaceholder="e.g. application/json"
  />
)

const KeyValueInputs = ({
  item,
  onItemChange,
  keyPlaceholder,
  valuePlaceholder,
}: TableListItemProps<KeyValue> & {
  keyPlaceholder?: string
  valuePlaceholder?: string
}) => {
  const handleKeyChange = (key: string) => {
    if (key === item.key) return
    onItemChange({ ...item, key })
  }
  const handleValueChange = (value: string) => {
    if (value === item.value) return
    onItemChange({ ...item, value })
  }
  return (
    <Stack p="4" borderRadius="md" flex="1" borderWidth="1px">
      <FormControl label="Key:">
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={item.key ?? ''}
          onChange={handleKeyChange}
          placeholder={keyPlaceholder}
        />
      </FormControl>
      <FormControl label="Value:">
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={item.value ?? ''}
          onChange={handleValueChange}
          placeholder={valuePlaceholder}
        />
      </FormControl>
    </Stack>
  )
}
