import { z } from 'zod'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { TRPCError } from '@trpc/server'
import { isDefined } from '@quickbot.io/lib'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { getAuthenticatedGoogleClient } from '@quickbot.io/lib/google'

export const getSpreadsheets = authenticatedProcedure
  .input(
    z.object({
      spreadsheetId: z.string().optional(),
      credentialsId: z.string().optional(),
    }),
  )
  .output(
    z.object({
      sheets: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          columns: z.array(z.string()),
        }),
      ),
      errors: z.array(z.string()).optional(),
    }),
  )
  .query(async ({ input: { spreadsheetId, credentialsId } }) => {
    if (!credentialsId || !spreadsheetId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `credentialsId and spreadsheetId is required`,
      })
    }
    const auth = await getAuthenticatedGoogleClient(credentialsId)
    if (!auth) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Couldn't find credentials in database",
      })
    }
    const doc = new GoogleSpreadsheet(spreadsheetId, auth)
    await doc.loadInfo()

    const errors: string[] = []
    const sheets = (
      await Promise.all(
        Array.from(Array(doc.sheetCount)).map(async (_, idx) => {
          const sheet = doc.sheetsByIndex[idx]
          try {
            await sheet.loadHeaderRow()
          } catch (err) {
            let errorMessage = `Sheet "${sheet.title}": Unable to load header row`
            if (err && typeof err === 'object' && 'message' in err) {
              errorMessage = `Sheet "${sheet.title}": ${err.message}`
            }
            console.log(errorMessage)
            errors.push(errorMessage)
            return
          }

          // Check for duplicate headers
          const headers = sheet.headerValues
          const duplicates = headers.filter((header, index) => headers.indexOf(header) !== index)
          if (duplicates.length > 0) {
            const errorMessage = `Sheet "${sheet.title}": Duplicate column headers found: ${duplicates.join(', ')}`
            errors.push(errorMessage)
            return
          }

          return {
            id: sheet.sheetId.toString(),
            name: sheet.title,
            columns: sheet.headerValues,
          }
        }),
      )
    ).filter(isDefined)

    return {
      sheets: sheets,
      errors: errors.length > 0 ? errors : undefined,
    }
  })
