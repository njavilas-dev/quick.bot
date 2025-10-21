import { stringify } from 'qs'

export const getGoogleSheetsConsentScreenUrlQuery = (
  redirectUrl: string,
  workspaceId: string,
  blockId?: string,
  botId?: string,
) => {
  const queryParams = stringify({
    redirectUrl,
    blockId,
    workspaceId,
    botId,
  })
  return `/api/credentials/google-sheets/consent-url?${queryParams}`
}
