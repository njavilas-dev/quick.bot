import { FormControl, InputText, Select } from '@urbiport/ui'
import { Alert, AlertIcon, VStack, HStack, IconButton } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@urbiport/icons'
import { Sheet } from '../types'

type Props = {
  sheets: Sheet[]
  isLoading: boolean
  sheetId?: string
  onSelectSheetId: (id: string | undefined) => void
  errors?: string[]
  spreadsheetId?: string
}

export const SheetsDropdown = ({ sheets, isLoading, sheetId, onSelectSheetId, errors, spreadsheetId }: Props) => {
  if (isLoading) {
    return (
      <FormControl>
        <InputText defaultValue="Loading..." isDisabled />
      </FormControl>
    )
  }
  if (!sheets || sheets.length === 0) {
    return (
      <VStack spacing={3} align="stretch">
        {errors && errors.length > 0 ? (
          errors.map((error, index) => (
            <Alert key={index} status="error" fontSize="sm">
              <AlertIcon />
              {error}
            </Alert>
          ))
        ) : (
          <Alert status="info" fontSize="sm">
            <AlertIcon />
            No valid sheets found. Make sure your spreadsheet contains at least one sheet with a header row and no duplicate column names.
          </Alert>
        )}
      </VStack>
    )
  }
  const handleOpenSpreadsheet = () => {
    if (spreadsheetId && sheetId) {
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`
      window.open(url, '_blank')
    }
  }

  return (
    <FormControl>
      <HStack spacing={1} >
        <Select
          selectedItem={sheetId}
          items={(sheets ?? []).map((s) => ({ label: s.name, value: s.id }))}
          onSelect={onSelectSheetId}
          placeholder={'Select the sheet'}
        />
        {sheetId && spreadsheetId && (
          <IconButton
            icon={<ExternalLinkIcon />}
            onClick={handleOpenSpreadsheet}
            aria-label="Open spreadsheet in Google Sheets"
            title="Open spreadsheet in Google Sheets"
            variant="outline"
          />
        )}
      </HStack>
    </FormControl>
  )
}
