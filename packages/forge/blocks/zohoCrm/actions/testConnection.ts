import { createAction, option } from '@quickbot.io/forge'
import { auth } from '../auth'
import { validateCredentials, createZohoCrmService, handleZohoCrmError } from '../utils/common'

export const testConnection = createAction({
  auth,
  name: 'Test Connection',
  options: option.object({}),
  run: {
    server: async ({ credentials, logs }) => {
      try {
        const validation = validateCredentials(credentials)
        if (!validation.isValid) {
          throw new Error(validation.error)
        }

        const zohoCrmService = createZohoCrmService(credentials)

        logs.add({
          status: 'info',
          description: 'Testing Client Credentials Flow...',
        })

        const tokens = await zohoCrmService.getAccessToken()
        logs.add({
          status: 'success',
          description: 'Successfully obtained access token!',
        })
        logs.add({
          status: 'info',
          description: `Token expires in: ${Math.round(tokens.expires_in / 60)} minutes`,
        })

        const orgData = await zohoCrmService.getOrganizationDetails()

        if (orgData.org && orgData.org.length > 0) {
          const org = orgData.org[0]
          logs.add({
            status: 'success',
            description: `Connection successful! Connected to: ${org.company_name}`,
            details: {
              organizationId: org.zgid,
              apiDomain: tokens.api_domain,
              scope: tokens.scope,
            },
          })
          logs.add({
            status: 'info',
            description: 'Organization Details',
            details: {
              name: org.company_name,
              id: org.zgid,
              apiDomain: tokens.api_domain,
              scope: tokens.scope,
            },
          })
        } else {
          logs.add({
            status: 'error',
            description: 'Connection established but no organization data found',
          })
        }
      } catch (error: any) {
        handleZohoCrmError(error, logs)
        throw error
      }
    },
  },
})
