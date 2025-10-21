import { FreshDeskTicket } from '../types/ticket.types'

export class TicketFormatterService {
  private getPriorityText(priority: number): string {
    const priorities: { [key: number]: string } = {
      1: 'Low',
      2: 'Medium',
      3: 'High',
      4: 'Urgent',
    }
    return priorities[priority] || 'Unknown'
  }

  private getStatusText(status: number): string {
    const statuses: { [key: number]: string } = {
      2: 'Open',
      3: 'Pending',
      4: 'Resolved',
      5: 'Closed',
    }
    return statuses[status] || 'Unknown'
  }

  private getSourceText(source: number): string {
    const sources: { [key: number]: string } = {
      1: 'Email',
      2: 'Portal',
      3: 'Phone',
      7: 'Chat',
      8: 'Mobihelp',
      9: 'Feedback Widget',
      10: 'Outbound Email',
    }
    return sources[source] || 'Unknown'
  }

  formatTicketSummary(ticket: FreshDeskTicket): string {
    return `🎫 **Ticket Created Successfully**

**Ticket ID:** #${ticket.id}
**Subject:** ${ticket.subject}
**Status:** ${this.getStatusText(ticket.status)}
**Priority:** ${this.getPriorityText(ticket.priority)}
**Created:** ${new Date(ticket.created_at).toLocaleString()}

Your ticket has been created and our support team will respond soon.`
  }

  formatTicketDetails(ticket: FreshDeskTicket): string {
    return `🎫 **Ticket Details**

**Ticket ID:** #${ticket.id}
**Subject:** ${ticket.subject}
**Description:** ${ticket.description_text || ticket.description}
**Status:** ${this.getStatusText(ticket.status)}
**Priority:** ${this.getPriorityText(ticket.priority)}
**Type:** ${ticket.type}
**Source:** ${this.getSourceText(ticket.source)}
**Created:** ${new Date(ticket.created_at).toLocaleString()}
**Updated:** ${new Date(ticket.updated_at).toLocaleString()}
${ticket.due_by ? `**Due:** ${new Date(ticket.due_by).toLocaleString()}` : ''}
${ticket.tags.length > 0 ? `**Tags:** ${ticket.tags.join(', ')}` : ''}`
  }

  formatTicketConfirmation(ticket: FreshDeskTicket, includeDetails: boolean = false): string {
    if (includeDetails) {
      return this.formatTicketDetails(ticket)
    }
    return this.formatTicketSummary(ticket)
  }
}
