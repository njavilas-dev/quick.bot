import { useState } from 'react'
import { IconButton, HStack } from '@chakra-ui/react'
import { SearchIcon, CloseIcon } from '@urbiport/icons'
import { InputText, Select } from '@urbiport/ui'

interface BotListFiltersProps {
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClearFilters: () => void
}

export const BotListFilters: React.FC<BotListFiltersProps> = ({
  onSearchChange,
  onStatusChange,
  onClearFilters,
}) => {

  const statusOptions = [
    { label: 'Live', value: 'live' },
    { label: 'Draft', value: 'draft' },
  ]

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange(value)
  }

  const handleStatusChange = (status: string | undefined) => {
    if (!status) return
    setStatus(status)
    onStatusChange(status)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    onClearFilters()
  }

  return (
    <HStack spacing={4}>
      <InputText
        placeholder="Search..."
        value={search}
        onChange={handleSearchChange}
        leftIcon={<SearchIcon color="text.light" />}
      />
      <Select
        withClear={false}
        placeholder="Status"
        selectedItem={status}
        onSelect={handleStatusChange}
        items={statusOptions}
      />
      <IconButton
        aria-label="Clear filters"
        icon={<CloseIcon />}
        variant="outline"
        color="text.light"
        size="md"
        onClick={clearFilters}
        disabled={!search && !status}
      />
    </HStack>
  )
}
