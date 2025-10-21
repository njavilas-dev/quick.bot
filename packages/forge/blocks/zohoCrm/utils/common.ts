import { ZohoCrmService } from '../services/api.services'

export interface ZohoCrmCredentials {
  clientId: string
  clientSecret: string
  organizationId: string
  domain: string
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Extracts the base domain from a complete Zoho CRM URL
 * @param url Complete URL like https://crm.zoho.com/ or https://crm.zoho.eu/
 * @returns The base domain like 'com', 'eu', etc.
 */
export function extractDomainFromUrl(url: string): string {
  try {
    const cleanUrl = url.trim()

    const urlWithProtocol = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`

    const parsedUrl = new URL(urlWithProtocol)
    const hostname = parsedUrl.hostname

    const domainParts = hostname.split('.')
    if (domainParts.length >= 2) {
      const lastPart = domainParts[domainParts.length - 1]
      const secondLastPart = domainParts[domainParts.length - 2]

      if (domainParts.length >= 3 && secondLastPart === 'zoho' && lastPart === 'com') {
        const thirdLastPart = domainParts[domainParts.length - 3]
        return `${lastPart}.${thirdLastPart}` // com.au, com.cn
      }

      if (secondLastPart === 'zoho') {
        return lastPart // com, eu, in
      }
    }

    return 'com'
  } catch {
    return 'com'
  }
}

/**
 * Normalizes a Zoho CRM URL to ensure it has the correct format
 * @param url User's URL
 * @returns Normalized URL
 */
export function normalizeZohoCrmUrl(url: string): string {
  try {
    const cleanUrl = url.trim()
    const urlWithProtocol = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`
    const parsedUrl = new URL(urlWithProtocol)

    const normalizedPath = parsedUrl.pathname.endsWith('/')
      ? parsedUrl.pathname
      : `${parsedUrl.pathname}/`

    return `${parsedUrl.protocol}//${parsedUrl.hostname}${normalizedPath}`
  } catch {
    // Return the original URL if parsing fails
    return url
  }
}

/**
 * Validates that Zoho CRM credentials are present and complete
 */
export function validateCredentials(credentials: any): ValidationResult {
  if (!credentials) {
    return {
      isValid: false,
      error: 'No credentials provided',
    }
  }

  if (
    !credentials.clientId ||
    !credentials.clientSecret ||
    !credentials.organizationId ||
    !credentials.domain
  ) {
    return {
      isValid: false,
      error: 'Missing required credentials',
    }
  }

  return { isValid: true }
}

/**
 * Creates a ZohoCrmService instance with validated credentials
 */
export function createZohoCrmService(credentials: any): ZohoCrmService {
  const domainBase = extractDomainFromUrl(credentials.domain)
  return new ZohoCrmService({
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
    organizationId: credentials.organizationId,
    domain: domainBase,
  })
}

/**
 * Handles specific Zoho CRM errors and adds informative logs
 */
export function handleZohoCrmError(error: any, logs: any): void {
  logs.add({
    status: 'error',
    description: 'Error connecting to Zoho CRM',
    details: { error: error.message },
  })

  if (error.message.includes('invalid_client')) {
    logs.add({
      status: 'info',
      description: 'Check your Client ID and Client Secret in Zoho Developer Console',
    })
  } else if (error.message.includes('soid')) {
    logs.add({
      status: 'info',
      description:
        'Check your Organization ID (SOID). Go to Zoho CRM → Profile → Click dropdown → Copy Org ID',
    })
  } else if (error.message.includes('scope')) {
    logs.add({
      status: 'info',
      description: 'Make sure your Self Client has the required scopes enabled',
    })
  } else if (error.message.includes('domain')) {
    logs.add({
      status: 'info',
      description: 'Check that your Zoho CRM URL is correct (e.g., https://crm.zoho.com/)',
    })
  }
}

/**
 * Validates that firstName and lastName are present
 */
export function validateRequiredNames(firstName?: string, lastName?: string): ValidationResult {
  if (!firstName || !lastName) {
    return {
      isValid: false,
      error: 'First Name and Last Name are required',
    }
  }

  return { isValid: true }
}

/**
 * Builds a direct CRM link for a specific record
 */
export function buildCrmLink(
  recordType: string,
  recordId: string,
  crmUrl: string,
  organizationId: string,
): string {
  const normalizedUrl = normalizeZohoCrmUrl(crmUrl)
  const baseUrl = normalizedUrl.replace(/\/$/, '') // Remove trailing slash
  return `${baseUrl}/crm/org${organizationId}/tab/${recordType}/${recordId}`
}

/**
 * Builds the full name from firstName and lastName
 */
export function buildFullName(firstName?: string, lastName?: string): string {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim()
}

/**
 * Gets the best available phone number from phone fields
 */
export function getBestPhoneNumber(phone?: string, mobile?: string): string {
  return phone ?? mobile ?? ''
}

/**
 * Initializes the service and gets the access token
 */
export async function initializeZohoCrmService(credentials: any): Promise<{
  service: ZohoCrmService
  tokens: any
}> {
  const service = createZohoCrmService(credentials)
  const tokens = await service.getAccessToken()
  return { service, tokens }
}
