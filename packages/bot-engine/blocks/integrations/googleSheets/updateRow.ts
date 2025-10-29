import { SessionState, GoogleSheetsUpdateRowOptions, ChatLog } from '@quickbot.io/schemas'
import { parseNewCellValuesObject } from './helpers/parseNewCellValuesObject'
import { getAuthenticatedGoogleDoc } from './helpers/getAuthenticatedGoogleDoc'
import { ExecuteIntegrationResponse } from '../../../types'
import { matchFilter } from './helpers/matchFilter'
import { deepParseVariables } from '@quickbot.io/variables/deepParseVariables'

export const updateRow = async (
  state: SessionState,
  { outgoingEdgeId, options }: { outgoingEdgeId?: string; options: GoogleSheetsUpdateRowOptions },
): Promise<ExecuteIntegrationResponse> => {
  const { variables } = state.botsQueue[0].bot
  const { sheetId, filter, ...parsedOptions } = deepParseVariables(variables, {
    removeEmptyStrings: true,
  })(options)

  const referenceCell =
    'referenceCell' in parsedOptions && parsedOptions.referenceCell
      ? parsedOptions.referenceCell
      : null

  if (!options.cellsToUpsert || !sheetId || (!referenceCell && !filter)) return { outgoingEdgeId }

  const logs: ChatLog[] = []

  try {
    const doc = await getAuthenticatedGoogleDoc({
      credentialsId: options.credentialsId,
      spreadsheetId: options.spreadsheetId,
    })

    await doc.loadInfo()
    const sheet = doc.sheetsById[Number(sheetId)]

    if (!sheet) {
      logs.push({
        status: 'error',
        description: `Sheet with ID ${sheetId} not found in the spreadsheet`,
      })
      return { outgoingEdgeId, logs }
    }

    // Load all rows from the sheet
    const allRows = await sheet.getRows()

    // Filter out completely empty rows by checking if ALL values are empty
    const rows = allRows.filter((row) => {
      const rowData = row.toObject()
      // Check if at least one value in the row is non-empty
      const hasNonEmptyValue = Object.values(rowData).some(value => {
        const stringValue = String(value ?? '').trim()
        return stringValue !== ''
      })
      return hasNonEmptyValue
    })

    const filteredRows = rows.filter((row) => {
      if (referenceCell) {
        return row.get(referenceCell.column as string) === referenceCell.value
      }
      if (filter) {
        return matchFilter(row, filter as NonNullable<typeof filter>)
      }
      return false
    })

    if (filteredRows.length === 0) {
      logs.push({
        status: 'info',
        description: `No rows found matching the specified criteria. This is normal when searching for values that don't exist.`,
        details: filter || referenceCell,
      })
      return { outgoingEdgeId, logs }
    }

    const parsedValues = parseNewCellValuesObject(variables)(
      options.cellsToUpsert,
      sheet.headerValues,
    )

    // Use batch update approach to avoid API quota issues
    let updatedRowsCount = 0
    const MAX_ROWS_TO_UPDATE = 100 // Limit to avoid quota issues
    const rowsToUpdate = filteredRows.slice(0, MAX_ROWS_TO_UPDATE)

    if (filteredRows.length > MAX_ROWS_TO_UPDATE) {
      logs.push({
        status: 'info',
        description: `Found ${filteredRows.length} matching rows, updating first ${MAX_ROWS_TO_UPDATE} to avoid API quota limits`,
      })
    }

    for (const filteredRow of rowsToUpdate) {
      try {
        for (const key in parsedValues) {
          filteredRow.set(key, parsedValues[key].value)
        }
        await filteredRow.save()
        updatedRowsCount++
      } catch (rowError: any) {
        logs.push({
          status: 'warning',
          description: `Failed to update row ${filteredRow.rowNumber}`,
          details: rowError?.message || 'Unknown error',
        })
      }
    }

    if (updatedRowsCount > 0) {
      logs.push({
        status: 'success',
        description: `Succesfully updated matching rows`,
      })
    } else {
      logs.push({
        status: 'warning',
        description: `No rows were successfully updated due to errors`,
      })
    }
  } catch (err: any) {
    logs.push({
      status: 'error',
      description: `An error occurred while updating the rows`,
      details: err?.message || 'Unknown error occurred',
    })
  }

  return { outgoingEdgeId, logs }
}
