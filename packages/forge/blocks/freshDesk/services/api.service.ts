import axios, { AxiosResponse } from 'axios'
import { FreshDeskCredentials, FreshDeskTicket, CreateFreshDeskTicket } from '../types/ticket.types'
import { FreshDeskApiMockService } from './api-mock.service'

export class FreshDeskApiService {
  private mockService?: FreshDeskApiMockService
  private baseUrl: string
  private apiKey: string

  constructor(credentials: FreshDeskCredentials) {
    this.baseUrl = `${credentials.domain}/api/v2`
    this.apiKey = credentials.apiKey

    if (process.env.TEST_ENV === 'true') {
      this.mockService = new FreshDeskApiMockService(credentials)
    }
  }

  private getAuthHeader() {
    return {
      Authorization: `Basic ${Buffer.from(`${this.apiKey}:X`).toString('base64')}`,
      'Content-Type': 'application/json',
    }
  }

  async createTicket(options: CreateFreshDeskTicket): Promise<FreshDeskTicket> {
    if (this.mockService) {
      return this.mockService.createTicket(options)
    }

    const url = `${this.baseUrl}/tickets`

    const ticketData = {
      subject: options.subject,
      description: options.description,
      email: options.email,
      priority: options.priority,
      status: options.status,
      type: options.type,
      source: options.source,
    }

    try {
      const response: AxiosResponse<FreshDeskTicket> = await axios.post(url, ticketData, {
        headers: this.getAuthHeader(),
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.errors?.[0]?.message || error.message
        throw new Error(`FreshDesk API Error: ${message}`)
      }
      throw new Error(`Failed to create ticket: ${error}`)
    }
  }

  async getTicketFields(): Promise<any[]> {
    if (this.mockService) {
      return this.mockService.getTicketFields()
    }

    const url = `${this.baseUrl}/ticket_fields`

    try {
      const response: AxiosResponse<any[]> = await axios.get(url, {
        headers: this.getAuthHeader(),
      })

      return response.data
    } catch (error) {
      console.log({ error })
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.errors?.[0]?.message || error.message
        throw new Error(`FreshDesk API Error: ${message}`)
      }
      throw new Error(`Failed to get ticket fields: ${error}`)
    }
  }
}
