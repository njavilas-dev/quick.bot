import { createAction, option } from '@quickbot.io/forge'
import { ZohoCrmLeadData, ZohoCrmResponse } from '../types/api.types'
import { auth } from '../auth'
import {
  validateCredentials,
  initializeZohoCrmService,
  validateRequiredNames,
  handleZohoCrmError,
} from '../utils/common'

export const createLead = createAction({
  auth,
  name: 'Create Lead',
  options: option.object({
    firstName: option.string.layout({
      label: 'First Name',
      isRequired: true,
      helperText: 'Lead first name',
      withVariableButton: true,
    }),
    lastName: option.string.layout({
      label: 'Last Name',
      isRequired: true,
      helperText: 'Lead last name',
      withVariableButton: true,
    }),
    email: option.string.layout({
      label: 'Email',
      isRequired: false,
      helperText: 'Lead email address',
      withVariableButton: true,
    }),
    phone: option.string.layout({
      label: 'Phone',
      isRequired: false,
      helperText: 'Lead phone number',
      withVariableButton: true,
    }),
    company: option.string.layout({
      label: 'Company',
      isRequired: false,
      helperText: 'Lead company name',
      withVariableButton: true,
    }),
    leadSource: option.string.layout({
      label: 'Lead Source',
      isRequired: false,
      helperText: 'Source of the lead (e.g., Website, Advertisement, etc.)',
      withVariableButton: true,
    }),
    industry: option.string.layout({
      label: 'Industry',
      isRequired: false,
      helperText: 'Lead industry',
      withVariableButton: true,
    }),
    storeLeadIdIn: option.string.layout({
      label: 'Store Lead ID in',
      isRequired: false,
      helperText: 'Variable to store the created lead ID',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeMessageIn: option.string.layout({
      label: 'Store Message in',
      isRequired: true,
      helperText: 'Variable where the lead creation result message will be stored',
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

        const { service } = await initializeZohoCrmService(credentials)

        const nameValidation = validateRequiredNames(options.firstName, options.lastName)
        if (!nameValidation.isValid) {
          variables.set(storeMessageIn, `❌ Error: ${nameValidation.error}`)
          return
        }

        const leadData: ZohoCrmLeadData = {
          First_Name: options.firstName!,
          Last_Name: options.lastName!,
          ...(options.email && { Email: options.email }),
          ...(options.phone && { Phone: options.phone }),
          ...(options.company && { Company: options.company }),
          ...(options.leadSource && { Lead_Source: options.leadSource }),
          ...(options.industry && { Industry: options.industry }),
        }

        const response = await service.makeApiRequest('/Leads', {
          method: 'POST',
          body: JSON.stringify({
            data: [leadData],
          }),
        })

        const responseData: ZohoCrmResponse = await response.json()

        if (!response.ok) {
          variables.set(
            storeMessageIn,
            `❌ Error: Failed to create lead - ${response.status} ${response.statusText}`,
          )
          return
        }

        if (responseData.data && responseData.data.length > 0) {
          const createdLead = responseData.data[0]

          if (options.storeLeadIdIn && createdLead.details?.id) {
            variables.set(options.storeLeadIdIn, createdLead.details.id)
          }

          variables.set(
            storeMessageIn,
            `✅ Lead created successfully! Lead ${options.firstName} ${options.lastName} has been created in Zoho CRM.`,
          )
        } else {
          variables.set(
            storeMessageIn,
            '⚠️ Partial success: Lead may have been created but response was empty',
          )
        }
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Lead creation error'
        variables.set(storeMessageIn, `❌ Error: ${errorMessage}`)
        handleZohoCrmError(error, logs)
      }
    },
  },
})
