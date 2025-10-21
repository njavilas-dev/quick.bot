import { createAction } from '@quickbot.io/forge'
import { option } from '@quickbot.io/forge'
import { WordPressService } from '../services/api.services'
import { WordPressCredentials } from '../types/api.types'

export const loginToWordpress = createAction({
  name: 'Login with WordPress',
  options: option.object({
    email: option.string.layout({
      label: 'Email',
      isRequired: true,
      helperText: 'Variable containing the user email',
      withVariableButton: true,
    }),
    password: option.string.layout({
      label: 'Password',
      isRequired: true,
      helperText: 'Variable containing the user password',
      withVariableButton: true,
    }),
    storeUserIdIn: option.string.layout({
      label: 'Store User ID in',
      isRequired: false,
      helperText: 'Variable where the user ID will be stored',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeAccessTokenIn: option.string.layout({
      label: 'Store Access Token in',
      isRequired: false,
      helperText: 'Variable where the access token will be stored',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeRefreshTokenIn: option.string.layout({
      label: 'Store Refresh Token in',
      isRequired: false,
      helperText: 'Variable where the refresh token will be stored',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeUsernameIn: option.string.layout({
      label: 'Store Username in',
      isRequired: false,
      helperText: 'Variable where the username will be stored',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeNicknameIn: option.string.layout({
      label: 'Store Nickname in',
      isRequired: false,
      helperText: 'Variable where the nickname will be stored',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeMessageIn: option.string.layout({
      label: 'Store Message in',
      isRequired: true,
      helperText: 'Variable where the login result message will be stored',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
  }),
  run: {
    server: async ({ credentials, options, variables }) => {
      const {
        email,
        password,
        storeUserIdIn,
        storeAccessTokenIn,
        storeRefreshTokenIn,
        storeUsernameIn,
        storeNicknameIn,
        storeMessageIn,
      } = options

      if (!storeMessageIn) {
        return
      }

      if (!email || !password) {
        variables.set(storeMessageIn, '❌ Error: Email and password are required')
        return
      }

      try {
        const wordpressCredentials: WordPressCredentials = {
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          tokenEndpoint: credentials.tokenEndpoint,
        }

        const wordpressService = new WordPressService(wordpressCredentials)
        const tokenData = await wordpressService.login(email, password)

        try {
          const userData = await wordpressService.getUserData(tokenData.access_token)

          if (storeUserIdIn) {
            variables.set(storeUserIdIn, userData.id)
          }
          if (storeAccessTokenIn) {
            variables.set(storeAccessTokenIn, tokenData.access_token)
          }
          if (storeRefreshTokenIn) {
            variables.set(storeRefreshTokenIn, tokenData.refresh_token)
          }
          if (storeUsernameIn) {
            variables.set(storeUsernameIn, userData.username)
          }
          if (storeNicknameIn) {
            variables.set(storeNicknameIn, userData.nickname)
          }

          variables.set(storeMessageIn, '✅ Login successful! You have been logged in correctly.')
        } catch (userError) {
          variables.set(
            storeMessageIn,
            '⚠️ Partial login: Token obtained but could not get user data',
          )
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication error'
        variables.set(storeMessageIn, `❌ Error: ${errorMessage}`)
      }
    },
  },
})
