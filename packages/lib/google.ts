import { OAuth2Client, Credentials } from 'google-auth-library'
import { env } from '@quickbot.io/env'
import { WorkspaceCredential as CredentialsFromDb } from '@quickbot.io/prisma'
import { decrypt } from './api/encryption/decrypt'
import { encrypt } from './api/encryption/encrypt'
import prisma from './prisma'
import { isDefined } from './utils'

export const getAuthenticatedGoogleClient = async (
  credentialsId: string,
): Promise<OAuth2Client | undefined> => {
  try {
    const credentials = await prisma.workspaceCredential.findFirst({
      where: { id: credentialsId },
    })

    if (!credentials) {
      console.warn(`Google Sheets credentials not found for ID: ${credentialsId}`)
      return undefined
    }

    const data = await decrypt(credentials.data, credentials.iv)

    const oauth2Client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      `${env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`,
    )

    oauth2Client.setCredentials(data)

    // Quick validation: if we don't have basic tokens, return undefined
    if (!oauth2Client.credentials.access_token && !oauth2Client.credentials.refresh_token) {
      console.warn('No valid tokens found in Google Sheets credentials')
      return undefined
    }

    const accessToken = oauth2Client.credentials.access_token
    let isTokenValid = true

    // Only check token validity if we have an access token
    if (accessToken) {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Token validation timeout')), 5000),
        )

        await Promise.race([oauth2Client.getTokenInfo(accessToken), timeoutPromise])
      } catch (err: any) {
        if (
          err?.response?.data?.error === 'invalid_token' ||
          err.message === 'Token validation timeout'
        ) {
          isTokenValid = false
        }
      }
    } else {
      isTokenValid = false
    }

    const isExpired =
      oauth2Client.credentials.expiry_date && oauth2Client.credentials.expiry_date < Date.now()

    // Try to refresh token if expired or invalid and we have a refresh token
    if (oauth2Client.credentials.refresh_token && (isExpired || !isTokenValid)) {
      try {
        // Add timeout to refresh operation to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Token refresh timeout')), 10000),
        )

        const refreshPromise = oauth2Client.refreshAccessToken()

        const { credentials: refreshedTokens } = (await Promise.race([
          refreshPromise,
          timeoutPromise,
        ])) as any

        oauth2Client.setCredentials(refreshedTokens)

        // Update tokens in database without waiting (fire and forget to avoid hanging)
        updateTokens(
          credentialsId,
          data,
        )(refreshedTokens).catch(() => {
          console.warn('Failed to update Google Sheets tokens in database')
        })
      } catch (error: any) {
        console.warn(
          'Google Sheets token refresh failed or timed out. The user may need to reconnect their account.',
        )

        // If refresh fails and we have no valid token, return undefined
        if (!oauth2Client.credentials.access_token || !isTokenValid) {
          return undefined
        }
      }
    }

    // Final check: if we still don't have a valid access token, return undefined
    if (!oauth2Client.credentials.access_token) {
      console.warn(
        'No valid Google Sheets access token available. User needs to reconnect their account.',
      )
      return undefined
    }

    // Set up token update listener without blocking
    oauth2Client.on('tokens', (credentials) => {
      updateTokens(
        credentialsId,
        data,
      )(credentials).catch(() => {
        console.warn('Failed to update Google Sheets tokens in database')
      })
    })

    return oauth2Client
  } catch (error: any) {
    console.warn(
      'Failed to authenticate Google Sheets client. User may need to reconnect their account.',
    )
    return undefined
  }
}

const updateTokens =
  (credentialsId: string, existingCredentials: any) => async (credentials: Credentials) => {
    try {
      if (
        isDefined(existingCredentials.id_token) &&
        credentials.id_token !== existingCredentials.id_token
      )
        return

      const newCredentials = {
        ...existingCredentials,
        expiry_date: credentials.expiry_date,
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token ?? existingCredentials.refresh_token,
      }

      const { encryptedData, iv } = await encrypt(newCredentials)

      await prisma.workspaceCredential.updateMany({
        where: { id: credentialsId },
        data: { data: encryptedData, iv },
      })
    } catch (error: any) {
      // Silently handle token update errors to avoid terminal spam
      console.warn('Failed to update Google Sheets tokens in database')
    }
  }
