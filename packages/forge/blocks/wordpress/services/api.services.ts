import {
  WordPressCredentials,
  TokenResponse,
  UserData,
  RegistrationData,
  RegistrationResponse,
} from '../types/api.types'

export class WordPressService {
  constructor(private credentials: WordPressCredentials) {}

  async login(email: string, password: string): Promise<TokenResponse> {
    const requestBody = {
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
      username: email,
      password: password,
      grant_type: 'password',
    }

    const response = await fetch(this.credentials.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const text = await response.text()
    if (!text) {
      throw new Error('Server responded with no data')
    }

    try {
      const tokenData = JSON.parse(text) as TokenResponse
      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error || 'Authentication error')
      }
      if (!response.ok) {
        throw new Error(
          tokenData.message || tokenData.error_description || `Server error (${response.status})`,
        )
      }
      return tokenData
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Could not process server response')
    }
  }

  async getUserData(accessToken: string): Promise<UserData> {
    const baseUrl = this.credentials.tokenEndpoint.split('/wp-json/')[0]
    const userEndpoint = `${baseUrl}/wp-json/moserver/resource`

    const response = await fetch(userEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Could not get user data')
    }

    return response.json()
  }

  async register(data: RegistrationData): Promise<RegistrationResponse> {
    // Validate admin credentials are available
    if (!this.credentials.adminUsername || !this.credentials.adminPassword) {
      throw new Error('Admin credentials are required for user registration')
    }

    const baseUrl = this.credentials.tokenEndpoint.split('/wp-json/')[0]
    const registerEndpoint = `${baseUrl}/wp-json/wp/v2/users`

    // Create Basic Auth header with admin credentials
    const authString = Buffer.from(
      `${this.credentials.adminUsername}:${this.credentials.adminPassword}`,
    ).toString('base64')

    const requestBody = {
      username: data.username,
      email: data.email,
      password: data.password,
      first_name: data.firstName || '',
      last_name: data.lastName || '',
      roles: ['subscriber'], // Default role for new registrations
    }

    const response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(requestBody),
    })

    const text = await response.text()
    if (!text) {
      throw new Error('Server responded with no data')
    }

    try {
      const responseData = JSON.parse(text) as any

      if (!response.ok) {
        // Handle specific WordPress errors
        if (responseData.code === 'existing_user_email') {
          throw new Error('email already exists')
        } else if (responseData.code === 'existing_user_login') {
          throw new Error('username already exists')
        } else if (responseData.code === 'invalid_email') {
          throw new Error('invalid_email')
        } else if (responseData.code === 'empty_password') {
          throw new Error('empty_password')
        } else if (
          responseData.code === 'rest_forbidden' ||
          responseData.code === 'rest_cannot_create'
        ) {
          throw new Error('Admin credentials do not have permission to create users')
        } else {
          throw new Error(responseData.message || `Registration failed (${response.status})`)
        }
      }

      return {
        id: responseData.id.toString(),
        username: responseData.username,
        email: responseData.email,
        first_name: responseData.first_name || '',
        last_name: responseData.last_name || '',
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Could not process registration response')
    }
  }
}
