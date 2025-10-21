export interface ZohoCrmCredentials {
  clientId: string
  clientSecret: string
  organizationId: string
  domain: string
}

export interface ZohoCrmTokens {
  access_token: string
  expires_in: number
  api_domain: string
  token_type: string
  scope: string
}

export interface ZohoCrmContactData {
  First_Name: string
  Last_Name: string
  Email?: string
  Phone?: string
  Account_Name?: string
  Title?: string
}

export interface ZohoCrmLeadData {
  First_Name: string
  Last_Name: string
  Email?: string
  Phone?: string
  Company?: string
  Lead_Source?: string
  Industry?: string
}

export interface ZohoCrmResponse {
  data: Array<{
    code: string
    details: {
      id: string
      created_time?: string
    }
    message: string
    status: string
  }>
}

export interface ZohoCrmOrganizationData {
  org: Array<{
    company_name: string
    zgid: string
    primary_domain?: string
    country?: string
  }>
}

export interface ZohoCrmLeadSearchResponse {
  data?: Array<{
    id: string
    Email: string
    First_Name: string
    Last_Name: string
    Lead_Status: string
    Phone?: string
    Mobile?: string
    Company?: string
    Lead_Source?: string
  }>
  info?: {
    count: number
    more_records: boolean
  }
}
