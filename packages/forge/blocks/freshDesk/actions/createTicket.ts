import { createAction, option } from '@quickbot.io/forge'
import { auth } from '../auth'
import {
  CreateFreshDeskTicket,
  CreateTicketOptions,
  TicketPriorityValue,
  TicketSourceValue,
} from '../types/ticket.types'
import { FreshDeskApiService } from '../services/api.service'
import { TicketFormatterService } from '../services/ticket-formatter.service'

export const createTicket = createAction({
  auth,
  name: 'Create Ticket',
  options: option.object({
    subject: option.string.layout({
      label: 'Subject',
      isRequired: true,
      withVariableButton: true,
      helperText: 'The subject/title of the ticket',
    }),
    description: option.string.layout({
      label: 'Description',
      isRequired: true,
      withVariableButton: true,
      helperText: 'Detailed description of the issue or request',
      inputType: 'textarea',
    }),
    email: option.string.layout({
      label: 'Requester Email',
      isRequired: true,
      withVariableButton: true,
      helperText: 'Email address of the person requesting support',
    }),
    priority: option.enum(['Low', 'Medium', 'High', 'Urgent']).layout({
      label: 'Priority',
      defaultValue: 'Low',
      helperText: 'Low, Medium, High, Urgent',
    }),
    source: option.enum(['Email', 'Portal', 'Phone', 'Chat', 'Mobihelp', 'Feedback Widget', 'Outbound Email']).layout({
      label: 'Source',
      defaultValue: 'Chat',
      helperText: 'Source of the ticket',
    }),
    type: option.string.layout({
      label: 'Type',
      defaultValue: 'Question',
      helperText: 'Type of ticket (Question, Incident, Problem, Feature Request)',
      withVariableButton: true,
    }),
    outputVariableId: option.string.layout({
      label: 'Output Variable',
      helperText: 'Variable where the ticket confirmation will be saved',
      inputType: 'variableDropdown',
    }),
    includeDetails: option.boolean.layout({
      direction: 'row',
      label: 'Include Full Details',
      defaultValue: false,
      moreInfoTooltip: 'Include complete ticket details in the output',
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

      const { subject, description, email, priority, source, type, outputVariableId, includeDetails } =
        options as CreateTicketOptions & { includeDetails?: boolean }

      if (!subject || !description || !email) {
        return logs.add({
          status: 'error',
          description: 'Subject, description, and email are required fields',
        })
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return logs.add({
          status: 'error',
          description: 'Please provide a valid email address',
        })
      }

      try {
        const apiService = new FreshDeskApiService({ domain, apiKey })
        const formatterService = new TicketFormatterService()

        const ticketOptions: CreateFreshDeskTicket = {
          subject,
          description,
          email,
          priority: priority ? TicketPriorityValue[priority] : 1,
          status: 2, // Open
          type: type || 'Question',
          source: source ? TicketSourceValue[source] : 7, // Default to Chat
        }

        const ticket = await apiService.createTicket(ticketOptions)

        logs.add({
          status: 'success',
          description: `Ticket #${ticket.id} created successfully for ${email}`,
        })

        const formattedOutput = formatterService.formatTicketConfirmation(ticket, includeDetails)

        if (outputVariableId) {
          variables.set(outputVariableId, formattedOutput)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

        console.error('FreshDesk Create Ticket Error:', error)

        if (outputVariableId) {
          variables.set(
            outputVariableId,
            'There was an error creating the ticket. Please try again.',
          )
        }

        logs.add({
          status: 'error',
          description: errorMessage,
        })
      }
    },
  },
})
