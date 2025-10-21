import { createAction, option } from '@quickbot.io/forge'
import { ZohoCrmLeadSearchResponse } from '../types/api.types'
import { auth } from '../auth'
import {
  validateCredentials,
  createZohoCrmService,
  buildCrmLink,
  buildFullName,
  getBestPhoneNumber,
} from '../utils/common'

export const getLeadByEmail = createAction({
  auth,
  name: 'Get Lead by Email',
  options: option.object({
    email: option.string.layout({
      label: 'Email',
      isRequired: true,
      helperText: 'Email address to search for in Zoho CRM leads',
      withVariableButton: true,
    }),
    storeFullNameIn: option.string.layout({
      label: 'Store Full Name in',
      isRequired: false,
      helperText: 'Variable to store the lead full name',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeLeadStatusIn: option.string.layout({
      label: 'Store Lead Status in',
      isRequired: false,
      helperText: 'Variable to store the lead status',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storePhoneIn: option.string.layout({
      label: 'Store Phone in',
      isRequired: false,
      helperText: 'Variable to store the lead phone number',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeLeadIdIn: option.string.layout({
      label: 'Store Lead ID in',
      isRequired: false,
      helperText: 'Variable to store the lead ID',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeCrmLinkIn: option.string.layout({
      label: 'Store CRM Link in',
      isRequired: false,
      helperText: 'Variable to store the direct link to the lead in Zoho CRM',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeCompanyIn: option.string.layout({
      label: 'Store Company in',
      isRequired: false,
      helperText: 'Variable to store the lead company',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeMessageIn: option.string.layout({
      label: 'Store Message in',
      isRequired: true,
      helperText: 'Variable where the lead search result message will be stored',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
  }),
  run: {
    server: async ({ credentials, options, variables, logs }) => {
      const { storeMessageIn } = options

      if (!storeMessageIn) {
        return
      }

      try {
        const validation = validateCredentials(credentials)
        if (!validation.isValid) {
          variables.set(storeMessageIn, `❌ Error: ${validation.error}`)
          return
        }

        if (!options.email) {
          variables.set(storeMessageIn, '❌ Error: Email is required')
          return
        }

        const zohoCrmService = createZohoCrmService(credentials)

        /**
         * Find a lead by email using the Zoho CRM API.
         */
        const searchCriteria = `((Email:equals:${options.email}))`
        const searchParams = new URLSearchParams({
          criteria: searchCriteria,
        })

        const response = await zohoCrmService.makeApiRequest(
          `/Leads/search?${searchParams.toString()}`,
        )

        if (!response.ok) {
          const errorText = await response.text()

          /**
           * Handle specific cases where no lead is found.
           */
          if (
            response.status === 404 ||
            errorText.includes('INVALID_DATA') ||
            errorText.includes('No data available')
          ) {
            variables.set(storeMessageIn, `❌ No lead found with email: ${options.email}`)
            return
          }

          variables.set(
            storeMessageIn,
            `❌ Error: Failed to search lead - ${response.status} ${response.statusText}`,
          )
          return
        }

        const responseData: ZohoCrmLeadSearchResponse = await response.json()

        if (!responseData.data || responseData.data.length === 0) {
          variables.set(storeMessageIn, `❌ No lead found with email: ${options.email}`)
          return
        }

        const lead = responseData.data[0]

        const fullName = buildFullName(lead.First_Name, lead.Last_Name)

        const phone = getBestPhoneNumber(lead.Phone, lead.Mobile)

        const crmLink = buildCrmLink(
          'Leads',
          lead.id,
          credentials.domain ?? '',
          credentials.organizationId ?? '',
        )

        if (options.storeFullNameIn && fullName) {
          variables.set(options.storeFullNameIn, fullName)
        }

        if (options.storeLeadStatusIn && lead.Lead_Status) {
          variables.set(options.storeLeadStatusIn, lead.Lead_Status)
        }

        if (options.storePhoneIn && phone) {
          variables.set(options.storePhoneIn, phone)
        }

        if (options.storeLeadIdIn && lead.id) {
          variables.set(options.storeLeadIdIn, lead.id)
        }

        if (options.storeCrmLinkIn) {
          variables.set(options.storeCrmLinkIn, crmLink)
        }

        if (options.storeCompanyIn && lead.Company) {
          variables.set(options.storeCompanyIn, lead.Company)
        }

        variables.set(
          storeMessageIn,
          `✅ Lead found successfully! Found lead ${fullName || options.email} in Zoho CRM.`,
        )
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Lead search error'
        variables.set(storeMessageIn, `❌ Error: email not found in our CRM`)
      }
    },
  },
})
