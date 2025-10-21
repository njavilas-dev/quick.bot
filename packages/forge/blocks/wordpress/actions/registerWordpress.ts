import { createAction } from '@quickbot.io/forge'
import { option } from '@quickbot.io/forge'
import { WordPressService } from '../services/api.services'
import { WordPressCredentials } from '../types/api.types'

export const registerWordpress = createAction({
  name: 'Register with WordPress',
  options: option.object({
    email: option.string.layout({
      label: 'Email',
      isRequired: true,
      helperText: 'Variable containing the user email for registration',
      withVariableButton: true,
    }),
    password: option.string.layout({
      label: 'Password',
      isRequired: true,
      helperText: 'Variable containing the user password for registration',
      withVariableButton: true,
    }),
    username: option.string.layout({
      label: 'Username',
      isRequired: false,
      helperText: 'Variable containing the username (optional, will use email if not provided)',
      withVariableButton: true,
    }),
    firstName: option.string.layout({
      label: 'First Name',
      isRequired: false,
      helperText: 'Variable containing the user first name (optional)',
      withVariableButton: true,
    }),
    lastName: option.string.layout({
      label: 'Last Name',
      isRequired: false,
      helperText: 'Variable containing the user last name (optional)',
      withVariableButton: true,
    }),
    storeUserIdIn: option.string.layout({
      label: 'Store User ID in',
      isRequired: false,
      helperText: 'Variable where the new user ID will be stored',
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
    storeMessageIn: option.string.layout({
      label: 'Store Message in',
      isRequired: true,
      helperText: 'Variable where the registration result message will be stored',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
  }),
  run: {
    server: async ({ credentials, options, variables }) => {
      const {
        email,
        password,
        username,
        firstName,
        lastName,
        storeUserIdIn,
        storeUsernameIn,
        storeMessageIn,
      } = options

      if (!storeMessageIn) {
        return
      }

      // Validate required fields
      if (!email || !password) {
        variables.set(storeMessageIn, '❌ Error: Email and password are required for registration')
        return
      }

      // Validate email format - using a safer approach to avoid ReDoS
      const isValidEmail = (email: string): boolean => {
        // Basic length check to prevent excessive processing
        if (!email || email.length > 254) return false

        const parts = email.split('@')
        if (parts.length !== 2) return false

        const [local, domain] = parts
        if (!local || !domain || local.length > 64) return false

        // Simple regex without nested quantifiers to avoid backtracking
        const localPattern = /^[a-zA-Z0-9._-]+$/
        const domainPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        return localPattern.test(local) && domainPattern.test(domain)
      }

      if (!isValidEmail(email)) {
        variables.set(storeMessageIn, '❌ Error: Invalid email format')
        return
      }

      // Validate password is not empty
      if (password.trim().length === 0) {
        variables.set(storeMessageIn, '❌ Error: Password cannot be empty')
        return
      }

      // Validate admin credentials are provided
      if (!credentials.adminUsername || !credentials.adminPassword) {
        variables.set(
          storeMessageIn,
          '❌ Error: Admin credentials are required for user registration. Please configure Admin Email and Application Password in the block settings.',
        )
        return
      }

      try {
        const wordpressCredentials: WordPressCredentials = {
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          tokenEndpoint: credentials.tokenEndpoint,
          adminUsername: credentials.adminUsername,
          adminPassword: credentials.adminPassword,
        }

        // Use email as username if no username provided
        const finalUsername = username && username.trim() ? username.trim() : email.trim()

        const registrationData = {
          email: email.trim(),
          password: password,
          username: finalUsername,
          firstName: firstName?.trim() || '',
          lastName: lastName?.trim() || '',
        }

        const wordpressService = new WordPressService(wordpressCredentials)
        const userData = await wordpressService.register(registrationData)

        // Store the results in variables
        if (storeUserIdIn && userData.id) {
          variables.set(storeUserIdIn, userData.id)
        }
        if (storeUsernameIn && userData.username) {
          variables.set(storeUsernameIn, userData.username)
        }

        variables.set(storeMessageIn, '✅ Registration successful! User account has been created.')
      } catch (error) {
        let errorMessage = 'Registration failed'

        if (error instanceof Error) {
          // Handle common WordPress registration errors
          if (
            error.message.includes('email_exists') ||
            error.message.includes('email already exists')
          ) {
            errorMessage = 'Email address is already registered'
          } else if (
            error.message.includes('username_exists') ||
            error.message.includes('username already exists')
          ) {
            errorMessage = 'Username is already taken'
          } else if (error.message.includes('invalid_email')) {
            errorMessage = 'Invalid email address format'
          } else if (error.message.includes('empty_password')) {
            errorMessage = 'Password cannot be empty'
          } else {
            errorMessage = error.message
          }
        }

        variables.set(storeMessageIn, `❌ Error: ${errorMessage}`)
      }
    },
  },
})
