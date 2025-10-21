import { createAction, option } from '@quickbot.io/forge'
import { auth } from '../auth'
import { FreshDeskApiService } from '../services/api.service'

export const getTicketTypes = createAction({
  auth,
  name: 'Get Ticket Types',
  options: option.object({
    arrayOutputVariableId: option.string.layout({
      label: 'Ticket Types Array Variable',
      inputType: 'variableDropdown',
    }),
    stringOutputVariableId: option.string.layout({
      label: 'Ticket Types string Variable',
      helperText: 'Variable where the ticket types list will be saved',
      inputType: 'variableDropdown',
    }),
  }),
  run: {
    server: async ({ credentials, options, variables, logs }) => {
      const { domain, apiKey } = credentials
      if (!domain || !apiKey) {
        return logs.add({
          status: 'error',
          description: 'FreshDesk API credentials are not properly configured',
        })
      }

      const { stringOutputVariableId, arrayOutputVariableId } = options

      if (!stringOutputVariableId && !arrayOutputVariableId) {
        return logs.add({
          status: 'error',
          description: 'String or array output variable is required',
        })
      }

      try {
        const apiService = new FreshDeskApiService({ domain, apiKey })

        const ticketFields = await apiService.getTicketFields()

        const ticketTypeField = ticketFields.find((field) => field.name === 'ticket_type')

        if (!ticketTypeField || !ticketTypeField.choices) {
          return logs.add({
            status: 'error',
            description: 'Ticket type field not found or has no choices available',
          })
        }

        const ticketTypesArray = ticketTypeField.choices.map(
          (choice: any) => choice.name || choice.value || choice,
        )

        if (typeof arrayOutputVariableId === 'string') {
          variables.set(
            arrayOutputVariableId,
            ticketTypesArray.map((type: string) => ({
              value: type,
              title: type,
            })),
          )
        }

        if (typeof stringOutputVariableId === 'string') {
          variables.set(stringOutputVariableId, ticketTypesArray.join(', '))
        }

        logs.add({
          status: 'success',
          description: `Successfully retrieved ${ticketTypeField.choices.length} ticket types`,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

        console.error('FreshDesk Get Ticket Types Error:', error)

        logs.add({
          status: 'error',
          description: errorMessage,
        })
      }
    },
  },
})
