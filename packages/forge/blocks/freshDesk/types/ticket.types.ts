export interface CreateTicketOptions {
  subject: string
  description: string
  email: string
  priority?: TicketPriority
  source?: TicketSource
  status?: number
  type?: string
  outputVariableId?: string
}

export interface CreateFreshDeskTicket {
  subject: string
  description: string
  email: string
  priority: number
  status: number
  type: string
  source: number
}

export interface FreshDeskTicket {
  id: number
  subject: string
  description: string
  status: number
  priority: number
  type: string
  source: number
  requester_id: number
  responder_id?: number
  created_at: string
  updated_at: string
  due_by?: string
  fr_due_by?: string
  is_escalated: boolean
  description_text: string
  spam: boolean
  email_config_id?: number
  group_id?: number
  product_id?: number
  company_id?: number
  tags: string[]
  cc_emails: string[]
  fwd_emails: string[]
  reply_cc_emails: string[]
  fr_escalated: boolean
  urgent: boolean
}

export interface FreshDeskCredentials {
  domain: string
  apiKey: string
}

export const TicketPriorities = ['Low', 'Medium', 'High', 'Urgent'] as const
export type TicketPriority = (typeof TicketPriorities)[number]

export const TicketPriorityValue: Record<TicketPriority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Urgent: 4,
}

export const TicketSources = ['Email', 'Portal', 'Phone', 'Chat', 'Mobihelp', 'Feedback Widget', 'Outbound Email'] as const
export type TicketSource = (typeof TicketSources)[number]

export const TicketSourceValue: Record<TicketSource, number> = {
  Email: 1,
  Portal: 2,
  Phone: 3,
  Chat: 7,
  Mobihelp: 8,
  'Feedback Widget': 9,
  'Outbound Email': 10,
}
