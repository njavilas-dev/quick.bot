export interface WooCommerceProduct {
  id: number
  name: string
  price: string
  permalink: string
  description?: string
  short_description?: string
  images?: Array<{ src: string }>
  stock_status?: string
  categories?: Array<{ id: number; name: string }>
  [key: string]: any
}

export interface SearchProductsOptions {
  searchTerm: string
  perPage: number
  outputVariableId: string
  outputDataVariableId: string
  formatType: 'list' | 'detail'
  includeLinks: boolean
  includePrices: boolean
}

export interface ProductFormatOptions {
  formatType: 'list' | 'detail'
  includeLinks: boolean
  includePrices: boolean
}

export interface ApiCredentials {
  siteUrl: string
  consumerKey: string
  consumerSecret: string
}
