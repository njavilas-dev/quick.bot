import { HttpRequestBlockV6 } from './schema'

export enum HttpMethod {
  POST = 'POST',
  GET = 'GET',
  }

export const defaultWebhookAttributes = {
  method: HttpMethod.POST,
} as const

export const defaultWebhookBlockOptions = {
  isAdvancedConfig: false,
  isCustomBody: false,
  isExecutedOnClient: false,
} as const satisfies HttpRequestBlockV6['options']

export const defaultTimeout = 10
export const maxTimeout = 120
