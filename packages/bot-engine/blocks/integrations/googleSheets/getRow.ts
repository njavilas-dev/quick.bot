import {
  SessionState,
  GoogleSheetsGetOptions,
  VariableWithValue,
  ChatLog,
} from '@quickbot.io/schemas'
import { isNotEmpty, byId, isDefined } from '@quickbot.io/lib'
import { getAuthenticatedGoogleDoc } from './helpers/getAuthenticatedGoogleDoc'
import { ExecuteIntegrationResponse } from '../../../types'
import { matchFilter } from './helpers/matchFilter'
import { deepParseVariables } from '@quickbot.io/variables/deepParseVariables'
import { getUpdatedVariablesInSession } from '@quickbot.io/variables/getUpdatedVariablesInSession'

export const getRow = async (
  state: SessionState,
  {
    blockId,
    outgoingEdgeId,
    options,
  }: {
    blockId: string
    outgoingEdgeId?: string
    options: GoogleSheetsGetOptions
  },
): Promise<ExecuteIntegrationResponse> => {
  const logs: ChatLog[] = []
  const { variables } = state.botsQueue[0].bot
  const { sheetId, cellsToExtract, filter, ...parsedOptions } = deepParseVariables(variables, {
    removeEmptyStrings: true,
  })(options)
  if (!sheetId) return { outgoingEdgeId }

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
    const filteredRows = getTotalRows(
      options.totalRowsToExtract,
      rows.filter((row) =>
        'referenceCell' in parsedOptions && parsedOptions.referenceCell
          ? row.get(parsedOptions.referenceCell?.column as string) ===
          parsedOptions.referenceCell?.value
          : matchFilter(row, filter),
      ),
    )

    if (filteredRows.length === 0) {
      logs.push({
        status: 'info',
        description: `No rows found matching the specified criteria. This is normal when searching for values that don't exist (e.g., unknown email addresses).`,
        details: JSON.stringify(
          filter || ('referenceCell' in parsedOptions ? parsedOptions.referenceCell : undefined),
          null,
          2,
        ),
      })
      return { outgoingEdgeId, logs }
    }

    const extractingColumns = cellsToExtract?.map((cell) => cell.column).filter(isNotEmpty)
    const selectedRows = filteredRows
      .map((row) =>
        extractingColumns?.reduce<{ [key: string]: string }>(
          (obj, column) => ({ ...obj, [column]: row.get(column) }),
          {},
        ),
      )
      .filter(isDefined)

    if (!selectedRows || selectedRows.length === 0) {
      logs.push({
        status: 'info',
        description: `Found ${filteredRows.length} matching rows, but no data could be extracted from the specified columns`,
      })
      return { outgoingEdgeId, logs }
    }

    const newVariables = options.cellsToExtract?.reduce<VariableWithValue[]>(
      (newVariables, cell) => {
        const existingVariable = variables.find(byId(cell.variableId))
        const value = selectedRows.map((row) => row[cell.column ?? ''])
        if (!existingVariable) return newVariables
        return [
          ...newVariables,
          {
            ...existingVariable,
            value: value.length === 1 ? value[0] : value,
          },
        ]
      },
      [],
    )

    if (!newVariables || newVariables.length === 0) {
      logs.push({
        status: 'info',
        description: `Found ${filteredRows.length} matching rows, but no variables were configured to store the data`,
      })
      return { outgoingEdgeId, logs }
    }

    logs.push({
      status: 'success',
      description: `Successfully retrieved ${filteredRows.length} row(s) and extracted data to ${newVariables.length} variable(s)`,
    })

    const { updatedState, newSetVariableHistory } = getUpdatedVariablesInSession({
      state,
      newVariables,
      currentBlockId: blockId,
    })

    return {
      outgoingEdgeId,
      newSessionState: updatedState,
      newSetVariableHistory,
      logs,
    }
  } catch (err: any) {
    // Don't log the full error to console to avoid terminal spam
    logs.push({
      status: 'error',
      description: `An error occurred while fetching the spreadsheet data`,
      details: err?.message || 'Unknown error occurred',
    })
    return { outgoingEdgeId, logs }
  }
}

const getTotalRows = <T>(
  totalRowsToExtract: GoogleSheetsGetOptions['totalRowsToExtract'],
  rows: T[],
): T[] => {
  switch (totalRowsToExtract) {
    case 'All':
    case undefined:
      return rows
    case 'First':
      return rows.slice(0, 1)
    case 'Last':
      return rows.slice(-1)
    case 'Random':
      return [rows[Math.floor(Math.random() * rows.length)]]
  }
}
