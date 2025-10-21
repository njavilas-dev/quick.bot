import { FreshDeskCredentials, FreshDeskTicket, CreateFreshDeskTicket } from '../types/ticket.types'

export class FreshDeskApiMockService {
  private baseUrl: string
  private apiKey: string

  constructor(credentials: FreshDeskCredentials) {
    this.baseUrl = `https://${credentials.domain}/api/v2`
    this.apiKey = credentials.apiKey
  }

  async createTicket(options: CreateFreshDeskTicket): Promise<FreshDeskTicket> {
    const mockTicket: FreshDeskTicket = {
      id: 12345,
      subject: options.subject,
      description: options.description,
      status: options.status,
      priority: options.priority,
      type: options.type,
      source: options.source,
      requester_id: 67890,
      responder_id: 11111,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_by: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      fr_due_by: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      is_escalated: false,
      description_text: options.description,
      spam: false,
      email_config_id: 1,
      group_id: 1,
      product_id: 100,
      company_id: 1,
      tags: ['test', 'mock'],
      cc_emails: [],
      fwd_emails: [],
      reply_cc_emails: [],
      fr_escalated: false,
      urgent: false,
    }

    return mockTicket
  }

  async getTicketFields(): Promise<any[]> {
    const mockFields = [
      {
        id: 1,
        name: 'requester',
        label: 'Requester',
        description: 'Ticket requester',
        type: 'default_requester',
        default: true,
        customers_can_edit: true,
        required_for_closure: false,
        required_for_agents: true,
        required_for_customers: true,
        displayed_to_customers: true,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'subject',
        label: 'Subject',
        description: 'Ticket subject',
        type: 'default_subject',
        default: true,
        customers_can_edit: true,
        required_for_closure: false,
        required_for_agents: true,
        required_for_customers: true,
        displayed_to_customers: true,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z',
      },
      {
        id: 3,
        name: 'description',
        label: 'Description',
        description: 'Ticket description',
        type: 'default_description',
        default: true,
        customers_can_edit: true,
        required_for_closure: false,
        required_for_agents: true,
        required_for_customers: true,
        displayed_to_customers: true,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z',
      },
      {
        id: 4,
        name: 'status',
        label: 'Status',
        description: 'Ticket status',
        type: 'default_status',
        default: true,
        customers_can_edit: false,
        required_for_closure: false,
        required_for_agents: true,
        required_for_customers: false,
        displayed_to_customers: true,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z',
        choices: [
          { id: 2, value: 'Open' },
          { id: 3, value: 'Pending' },
          { id: 4, value: 'Resolved' },
          { id: 5, value: 'Closed' },
        ],
      },
      {
        id: 5,
        name: 'priority',
        label: 'Priority',
        description: 'Ticket priority',
        type: 'default_priority',
        default: true,
        customers_can_edit: false,
        required_for_closure: false,
        required_for_agents: true,
        required_for_customers: false,
        displayed_to_customers: true,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z',
        choices: [
          { id: 1, value: 'Low' },
          { id: 2, value: 'Medium' },
          { id: 3, value: 'High' },
          { id: 4, value: 'Urgent' },
        ],
      },
      {
        id: 204000244352,
        name: 'ticket_type',
        label: 'Type',
        description: 'Ticket type',
        position: 3,
        required_for_closure: false,
        required_for_agents: false,
        type: 'default_ticket_type',
        default: true,
        customers_can_edit: true,
        customers_can_filter: false,
        label_for_customers: 'Type',
        required_for_customers: false,
        displayed_to_customers: true,
        created_at: '2025-01-16T11:55:05Z',
        updated_at: '2025-02-07T09:42:07Z',
        choices: [
          'Question',
          'Incident',
          'Problem',
          'Feature Request',
          'Refund',
          'Feature requests',
        ],
      },
    ]

    return mockFields
  }
}
