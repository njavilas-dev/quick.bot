import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, initMiddleware, methodNotAllowed, notFound } from '@quickbot.io/lib/api'
import { hasValue, isDefined } from '@quickbot.io/lib'
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'
import {
  GoogleSheetsGetOptions,
  GoogleSheetsInsertRowOptions,
  GoogleSheetsUpdateRowOptions,
} from '@quickbot.io/schemas'
import Cors from 'cors'
import { getAuthenticatedGoogleClient } from '@quickbot.io/lib/google'
import { saveErrorLog } from '@quickbot.io/bot-engine/logs/saveErrorLog'
import { saveSuccessLog } from '@quickbot.io/bot-engine/logs/saveSuccessLog'
import { GoogleSheetsAction } from '@quickbot.io/schemas/features/blocks/integrations/googleSheets/constants'
import {
  ComparisonOperators,
  LogicalOperator,
} from '@quickbot.io/schemas/features/blocks/logic/condition/constants'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method !== 'POST') return methodNotAllowed(res)
  const action = req.body.action as GoogleSheetsAction | undefined
  if (!action) return badRequest(res, 'Missing action')
  switch (action) {
    case GoogleSheetsAction.GET: {
      return await getRows(req, res)
    }
    case GoogleSheetsAction.INSERT_ROW: {
      return await insertRow(req, res)
    }
    case GoogleSheetsAction.UPDATE_ROW: {
      return await updateRow(req, res)
    }
  }
}

const getRows = async (req: NextApiRequest, res: NextApiResponse) => {
  const sheetId = req.query.sheetId as string
  const spreadsheetId = req.query.spreadsheetId as string
  const body = req.body as GoogleSheetsGetOptions & {
    resultId?: string
    columns: string[] | string
  }
  const referenceCell = 'referenceCell' in body ? body.referenceCell : undefined
  const { resultId, credentialsId, filter, columns } = body

  if (!hasValue(credentialsId)) {
    badRequest(res)
    return
  }

  const extractingColumns = getExtractingColumns(columns)

  if (!extractingColumns) {
    badRequest(res)
    return
  }

  try {
    const client = await getAuthenticatedGoogleClient(credentialsId)
    if (!client) {
      await saveErrorLog({
        resultId,
        message: "Couldn't find credentials in database or authentication failed",
      })
      notFound(res, "Couldn't find credentials in database")
      return
    }

    const doc = new GoogleSpreadsheet(spreadsheetId, client)
    await doc.loadInfo()
    const sheet = doc.sheetsById[Number(sheetId)]

    if (!sheet) {
      await saveErrorLog({
        resultId,
        message: `Sheet with ID ${sheetId} not found in the spreadsheet`,
      })
      res.status(404).send('Sheet not found')
      return
    }

    const rows = await sheet.getRows()
    const filteredRows = rows.filter((row) =>
      referenceCell
        ? row.get(referenceCell.column as string) === referenceCell.value
        : matchFilter(row, filter as NonNullable<typeof filter>),
    )

    if (filteredRows.length === 0) {
      await saveSuccessLog({
        resultId,
        message:
          "No rows found matching the specified criteria. This is normal when searching for values that don't exist (e.g., unknown email addresses).",
      })
      res.status(200).send({ rows: [] })
      return
    }

    const response = {
      rows: filteredRows.map((row) =>
        extractingColumns.reduce<{ [key: string]: string }>(
          (obj, column) => ({ ...obj, [column]: row.get(column) }),
          {},
        ),
      ),
    }

    await saveSuccessLog({
      resultId,
      message: `Successfully fetched ${filteredRows.length} row(s) from spreadsheet`,
    })
    res.status(200).send(response)
    return
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    await saveErrorLog({
      resultId,
      message: 'An error occurred while fetching the spreadsheet data',
      details: errorMessage,
    })
    res.status(500).send({
      error: 'Failed to fetch spreadsheet data',
      message: errorMessage,
    })
    return
  }
}

const insertRow = async (req: NextApiRequest, res: NextApiResponse) => {
  const sheetId = req.query.sheetId as string
  const spreadsheetId = req.query.spreadsheetId as string
  const { resultId, credentialsId, values } = req.body as GoogleSheetsInsertRowOptions & {
    resultId?: string
    values: { [key: string]: string }
  }
  if (!hasValue(credentialsId)) return badRequest(res)

  try {
    const auth = await getAuthenticatedGoogleClient(credentialsId)
    if (!auth) {
      await saveErrorLog({
        resultId,
        message: "Couldn't find credentials in database or authentication failed",
      })
      return res.status(404).send("Couldn't find credentials in database")
    }

    const doc = new GoogleSpreadsheet(spreadsheetId, auth)
    await doc.loadInfo()
    const sheet = doc.sheetsById[Number(sheetId)]

    if (!sheet) {
      await saveErrorLog({
        resultId,
        message: `Sheet with ID ${sheetId} not found in the spreadsheet`,
      })
      return res.status(404).send('Sheet not found')
    }

    await sheet.addRow(values)
    await saveSuccessLog({ resultId, message: 'Succesfully inserted row' })
    return res.send({ message: 'Success' })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    await saveErrorLog({
      resultId,
      message: 'An error occurred while inserting the row',
      details: errorMessage,
    })
    return res.status(500).send({
      error: 'Failed to insert row',
      message: errorMessage,
    })
  }
}

const updateRow = async (req: NextApiRequest, res: NextApiResponse) => {
  const sheetId = req.query.sheetId as string
  const spreadsheetId = req.query.spreadsheetId as string
  const body = req.body as GoogleSheetsUpdateRowOptions & {
    resultId?: string
    values: { [key: string]: string }
  }
  const referenceCell = 'referenceCell' in body ? body.referenceCell : undefined
  const { resultId, credentialsId, values } = body

  if (!hasValue(credentialsId) || !referenceCell) return badRequest(res)

  try {
    const auth = await getAuthenticatedGoogleClient(credentialsId)
    if (!auth) {
      await saveErrorLog({
        resultId,
        message: "Couldn't find credentials in database or authentication failed",
      })
      return res.status(404).send("Couldn't find credentials in database")
    }

    const doc = new GoogleSpreadsheet(spreadsheetId, auth)
    await doc.loadInfo()
    const sheet = doc.sheetsById[Number(sheetId)]

    if (!sheet) {
      await saveErrorLog({
        resultId,
        message: `Sheet with ID ${sheetId} not found in the spreadsheet`,
      })
      return res.status(404).send('Sheet not found')
    }

    const rows = await sheet.getRows()
    const updatingRowIndex = rows.findIndex(
      (row) => row.get(referenceCell.column as string) === referenceCell.value,
    )

    if (updatingRowIndex === -1) {
      await saveSuccessLog({
        resultId,
        message:
          "No rows found matching the specified criteria. This is normal when searching for values that don't exist.",
      })
      return res.status(200).send({
        message: 'No rows found to update',
        updatedRows: 0,
      })
    }

    for (const key in values) {
      rows[updatingRowIndex].set(key, values[key])
    }
    await rows[updatingRowIndex].save()

    await saveSuccessLog({ resultId, message: 'Succesfully updated row' })
    return res.send({ message: 'Success', updatedRows: 1 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    await saveErrorLog({
      resultId,
      message: 'An error occurred while updating the spreadsheet data',
      details: errorMessage,
    })
    return res.status(500).send({
      error: 'Failed to update spreadsheet data',
      message: errorMessage,
    })
  }
}

const matchFilter = (
  row: GoogleSpreadsheetRow,
  filter: NonNullable<GoogleSheetsGetOptions['filter']>,
) => {
  return filter.logicalOperator === LogicalOperator.AND
    ? filter.comparisons?.every(
        (comparison) =>
          comparison.column &&
          matchComparison(
            row.get(comparison.column),
            comparison.comparisonOperator,
            comparison.value,
          ),
      )
    : filter.comparisons?.some(
        (comparison) =>
          comparison.column &&
          matchComparison(
            row.get(comparison.column),
            comparison.comparisonOperator,
            comparison.value,
          ),
      )
}

const matchComparison = (
  inputValue?: string,
  comparisonOperator?: ComparisonOperators,
  value?: string,
) => {
  if (!inputValue || !comparisonOperator || !value) return false
  switch (comparisonOperator) {
    case ComparisonOperators.CONTAINS: {
      return inputValue.toLowerCase().includes(value.toLowerCase())
    }
    case ComparisonOperators.EQUAL: {
      return inputValue === value
    }
    case ComparisonOperators.NOT_EQUAL: {
      return inputValue !== value
    }
    case ComparisonOperators.GREATER: {
      return parseFloat(inputValue) > parseFloat(value)
    }
    case ComparisonOperators.LESS: {
      return parseFloat(inputValue) < parseFloat(value)
    }
    case ComparisonOperators.IS_SET: {
      return isDefined(inputValue) && inputValue.length > 0
    }
  }
}

const getExtractingColumns = (columns: string | string[] | undefined) => {
  if (typeof columns === 'string') return [columns]
  if (Array.isArray(columns)) return columns
}

export default handler
