import { createAction, option } from '@quickbot.io/forge'
import { auth } from '../auth'
import { validateCredentials, initializeZohoCrmService, handleZohoCrmError } from '../utils/common'

export const getOrganizationInfo = createAction({
  auth,
  name: 'Get Organization Info',
  options: option.object({
    storeOrgNameIn: option.string.layout({
      label: 'Store Organization Name in',
      isRequired: false,
      helperText: 'Variable where the organization name will be stored',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeOrgIdIn: option.string.layout({
      label: 'Store Organization ID in',
      isRequired: false,
      helperText: 'Variable where the organization ID will be stored',
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
  }),
  run: {
    server: async ({ credentials, options, variables, logs }) => {
      try {
        const validation = validateCredentials(credentials)
        if (!validation.isValid) {
          throw new Error(validation.error)
        }

        const { service, tokens } = await initializeZohoCrmService(credentials)

        const orgData = await service.getOrganizationDetails()

        if (orgData.org && orgData.org.length > 0) {
          const org = orgData.org[0]

          if (options.storeOrgNameIn) {
            variables.set(options.storeOrgNameIn, org.company_name ?? '')
          }

          if (options.storeOrgIdIn) {
            variables.set(options.storeOrgIdIn, org.zgid ?? '')
          }

          if (options.storeAccessTokenIn) {
            variables.set(options.storeAccessTokenIn, tokens.access_token)
          }
        } else {
          logs.add({
            status: 'error',
            description: 'No organization data found',
          })
        }
      } catch (error: any) {
        handleZohoCrmError(error, logs)
        throw error
      }
    },
  },
})
