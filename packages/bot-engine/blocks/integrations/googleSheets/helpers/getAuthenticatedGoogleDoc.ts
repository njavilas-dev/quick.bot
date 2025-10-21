import { TRPCError } from '@trpc/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { getAuthenticatedGoogleClient } from '@quickbot.io/lib/google'

export const getAuthenticatedGoogleDoc = async ({
  credentialsId,
  spreadsheetId,
}: {
  credentialsId?: string
  spreadsheetId?: string
}) => {
  if (!credentialsId || !spreadsheetId)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing credentialsId or spreadsheetId',
    })

  try {
    const auth = await getAuthenticatedGoogleClient(credentialsId)
    if (!auth)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: "Couldn't find credentials in database",
      })

    return new GoogleSpreadsheet(spreadsheetId, auth)
  } catch (error: any) {
    // Handle specific Google API errors
    if (error?.message?.includes('invalid_token') || error?.message?.includes('401')) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Google authentication has expired. Please reconnect your Google Sheets account.',
      })
    }

    if (error?.message?.includes('403')) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'Insufficient permissions to access the Google Sheets. Please check sharing settings.',
      })
    }

    if (error?.message?.includes('404')) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'The specified Google Sheet was not found or no longer exists.',
      })
    }

    // Re-throw TRPCErrors as-is
    if (error.code) {
      throw error
    }

    // Handle other errors
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to authenticate with Google Sheets: ${error?.message || 'Unknown error'}`,
    })
  }
}
