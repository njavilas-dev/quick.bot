import { createAction, option } from '@quickbot.io/forge'
import { ZohoCrmContactData, ZohoCrmResponse } from '../types/api.types'
import { auth } from '../auth'
import {
  validateCredentials,
  initializeZohoCrmService,
  validateRequiredNames,
  handleZohoCrmError,
} from '../utils/common'

export const createContact = createAction({
  auth,
  name: 'Create Contact',
  options: option.object({
    firstName: option.string.layout({
      label: 'First Name',
      isRequired: true,
      helperText: 'Contact first name',
      withVariableButton: true,
    }),
    lastName: option.string.layout({
      label: 'Last Name',
      isRequired: true,
      helperText: 'Contact last name',
      withVariableButton: true,
    }),
    email: option.string.layout({
      label: 'Email',
      isRequired: false,
      helperText: 'Contact email address',
      withVariableButton: true,
    }),
    phone: option.string.layout({
      label: 'Phone',
      isRequired: false,
      helperText: 'Contact phone number',
      withVariableButton: true,
    }),
    company: option.string.layout({
      label: 'Account Name',
      isRequired: false,
      helperText: 'Company/Account name',
      withVariableButton: true,
    }),
    title: option.string.layout({
      label: 'Title',
      isRequired: false,
      helperText: 'Job title',
      withVariableButton: true,
    }),
    storeContactIdIn: option.string.layout({
      label: 'Store Contact ID in',
      isRequired: false,
      helperText: 'Variable to store the created contact ID',
      withVariableButton: true,
      inputType: 'variableDropdown',
    }),
    storeMessageIn: option.string.layout({
      label: 'Store Message in',
      isRequired: true,
      helperText: 'Variable where the contact creation result message will be stored',
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

        const contactData: ZohoCrmContactData = {
          First_Name: options.firstName!,
          Last_Name: options.lastName!,
          ...(options.email && { Email: options.email }),
          ...(options.phone && { Phone: options.phone }),
          ...(options.company && { Account_Name: options.company }),
          ...(options.title && { Title: options.title }),
        }

        const response = await service.makeApiRequest('/Contacts', {
          method: 'POST',
          body: JSON.stringify({
            data: [contactData],
          }),
        })

        const responseData: ZohoCrmResponse = await response.json()

        if (!response.ok) {
          variables.set(
            storeMessageIn,
            `❌ Error: Failed to create contact - ${response.status} ${response.statusText}`,
          )
          return
        }

        if (responseData.data && responseData.data.length > 0) {
          const createdContact = responseData.data[0]

          if (options.storeContactIdIn && createdContact.details?.id) {
            variables.set(options.storeContactIdIn, createdContact.details.id)
          }

          variables.set(
            storeMessageIn,
            `✅ Contact created successfully! Contact ${options.firstName} ${options.lastName} has been created in Zoho CRM.`,
          )
        } else {
          variables.set(
            storeMessageIn,
            '⚠️ Partial success: Contact may have been created but response was empty',
          )
        }
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Contact creation error'
        console.log('errorMessage', errorMessage)
        variables.set(storeMessageIn, `❌ Error: ${errorMessage}`)
        handleZohoCrmError(error, logs)
      }
    },
  },
})
