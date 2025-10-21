import { SessionState, GoogleSheetsInsertRowOptions, ChatLog } from '@quickbot.io/schemas'
import { parseNewRowObject } from './helpers/parseNewRowObject'
import { getAuthenticatedGoogleDoc } from './helpers/getAuthenticatedGoogleDoc'
import { ExecuteIntegrationResponse } from '../../../types'

export const insertRow = async (
  state: SessionState,
  { outgoingEdgeId, options }: { outgoingEdgeId?: string; options: GoogleSheetsInsertRowOptions },
): Promise<ExecuteIntegrationResponse> => {
  const { variables } = state.botsQueue[0].bot
  if (!options.cellsToInsert || !options.sheetId) return { outgoingEdgeId }

  const logs: ChatLog[] = []

  try {
    const doc = await getAuthenticatedGoogleDoc({
      credentialsId: options.credentialsId,
      spreadsheetId: options.spreadsheetId,
    })

    const parsedValues = parseNewRowObject(variables)(options.cellsToInsert)

    await doc.loadInfo()
    const sheet = doc.sheetsById[Number(options.sheetId)]

    if (!sheet) {
      logs.push({
        status: 'error',
        description: `Sheet with ID ${options.sheetId} not found in the spreadsheet`,
      })
      return { outgoingEdgeId, logs }
    }

    await sheet.addRow(parsedValues)
    logs.push({
      status: 'success',
      description: `Succesfully inserted row in ${doc.title} > ${sheet.title}`,
    })
  } catch (err: any) {
    // Don't log the full error to console to avoid terminal spam
    logs.push({
      status: 'error',
      description: `An error occurred while inserting the row`,
      details: err?.message || 'Unknown error occurred',
    })
  }

  return { outgoingEdgeId, logs }
}
