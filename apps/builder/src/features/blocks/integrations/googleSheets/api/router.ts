import { router } from '@/helpers/server/trpc'
import { getAccessToken } from './getAccessToken'
import { getSpreadsheetName } from './getSpreadsheetName'
import { getSpreadsheets } from './getSpreadsheets'

export const googleSheetsRouter = router({
  getAccessToken,
  getSpreadsheets,
  getSpreadsheetName,
})
