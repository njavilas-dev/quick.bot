import { ZohoCrmCredentials, ZohoCrmTokens, ZohoCrmOrganizationData } from '../types/api.types'

export class ZohoCrmService {
  private readonly credentials: ZohoCrmCredentials
  private tokens?: ZohoCrmTokens
  private tokenExpiresAt?: number
  private readonly apiDomains = {
    com: 'https://www.zohoapis.com',
    eu: 'https://www.zohoapis.eu',
    in: 'https://www.zohoapis.in',
    'com.cn': 'https://www.zohoapis.com.cn',
    'com.au': 'https://www.zohoapis.com.au',
  }
  private readonly accountsDomains = {
    com: 'https://accounts.zoho.com',
    eu: 'https://accounts.zoho.eu',
    in: 'https://accounts.zoho.in',
    'com.cn': 'https://accounts.zoho.com.cn',
    'com.au': 'https://accounts.zoho.com.au',
  }

  constructor(credentials: ZohoCrmCredentials) {
    this.credentials = credentials
  }

  /**
   * Get access token using Client Credentials Flow
   */
  async getAccessToken(): Promise<ZohoCrmTokens> {
    if (this.tokens && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.tokens
    }

    const accountsUrl = this.getAccountsUrl()
    const soid = `ZohoCRM.${this.credentials.organizationId}`
    const scope = 'ZohoCRM.modules.ALL,ZohoCRM.users.READ,ZohoCRM.org.READ,ZohoCRM.settings.READ'

    const tokenUrl = `${accountsUrl}/oauth/v2/token?client_id=${this.credentials.clientId}&client_secret=${this.credentials.clientSecret}&grant_type=client_credentials&scope=${scope}&soid=${soid}`

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get Zoho access token: ${error}`)
    }

    const tokenData = await response.json()

    if (tokenData.error) {
      throw new Error(`Zoho OAuth error: ${tokenData.error} - ${tokenData.error_description}`)
    }

    this.tokens = {
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      api_domain: tokenData.api_domain ?? this.getApiDomain(),
      token_type: tokenData.token_type ?? 'Bearer',
      scope: tokenData.scope ?? scope,
    }

    // Calculate when the token expires (with a 5-minute margin)
    this.tokenExpiresAt = Date.now() + tokenData.expires_in * 1000 - 5 * 60 * 1000

    return this.tokens
  }

  /**
   * Makes an authenticated request to the Zoho CRM API
   */
  async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const tokens = await this.getAccessToken()
    const url = `${tokens.api_domain}/crm/v8${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `${tokens.token_type} ${tokens.access_token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // If the token expired, get a new one and retry
    if (response.status === 401) {
      // Force getting a new token
      this.tokens = undefined
      this.tokenExpiresAt = undefined

      const newTokens = await this.getAccessToken()

      // Retry the request with the new token
      return await fetch(url, {
        ...options,
        headers: {
          Authorization: `${newTokens.token_type} ${newTokens.access_token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
    }

    return response
  }

  private getApiDomain(): string {
    return (
      this.apiDomains[this.credentials.domain as keyof typeof this.apiDomains] ||
      this.apiDomains.com
    )
  }

  private getAccountsUrl(): string {
    return (
      this.accountsDomains[this.credentials.domain as keyof typeof this.accountsDomains] ||
      this.accountsDomains.com
    )
  }

  /**
   * Gets organization information to validate the connection
   */
  async getOrganizationDetails(): Promise<ZohoCrmOrganizationData> {
    const response = await this.makeApiRequest('/org')

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Failed to get organization details: ${response.status} ${response.statusText} - ${errorText}`,
      )
    }

    return await response.json()
  }

  /**
   * Gets current token information
   */
  getTokenInfo(): ZohoCrmTokens | undefined {
    return this.tokens
  }
}
