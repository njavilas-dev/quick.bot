import { FormControl, InputText, Select } from '@urbiport/ui'
import { Group } from '@quickbot.io/schemas'

type Props = {
  groups: Group[]
  groupId?: string
  onGroupIdSelected: (groupId: string | undefined) => void
  isLoading?: boolean
}

export const GroupsDropdown = ({ groups, groupId, onGroupIdSelected, isLoading }: Props) => {
  if (isLoading) {
    return (
      <FormControl>
        <InputText defaultValue="Loading..." isDisabled />
      </FormControl>
    )
  }
  if (!groups || groups.length === 0) {
    return (
      <FormControl>
        <InputText defaultValue="No groups found" isDisabled />
      </FormControl>
    )
  }
  return (
    <FormControl>
      <Select
        selectedItem={groupId}
        items={(groups ?? []).map((group) => ({
          label: group.title,
          value: group.id,
        }))}
        onSelect={onGroupIdSelected}
        placeholder={'Select a group'}
      />
    </FormControl>
  )
}
