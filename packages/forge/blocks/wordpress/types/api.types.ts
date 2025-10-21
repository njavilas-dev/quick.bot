export interface WordPressCredentials {
  clientId: string
  clientSecret: string
  tokenEndpoint: string
  adminUsername?: string
  adminPassword?: string
  [key: string]: any
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  error?: string
  error_description?: string
  message?: string
}

export interface UserData {
  id: string
  username: string
  nickname: string
}

export interface RegistrationData {
  email: string
  password: string
  username: string
  firstName?: string
  lastName?: string
}

export interface RegistrationResponse {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
}
