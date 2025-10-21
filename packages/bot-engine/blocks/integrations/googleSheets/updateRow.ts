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

    const rows = await sheet.getRows()

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

    // Use the simple approach: update rows using the row objects directly
    let updatedRowsCount = 0
    for (const filteredRow of filteredRows) {
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
