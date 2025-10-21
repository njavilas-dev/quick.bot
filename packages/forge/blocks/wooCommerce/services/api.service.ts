import axios, { AxiosInstance } from 'axios'
import addOAuthInterceptor from 'axios-oauth-1.0a'
import { ApiCredentials, WooCommerceProduct } from '../types/product.types'

export class ApiService {
  client: AxiosInstance
  baseUrl: string

  constructor(credentials: ApiCredentials) {
    const { siteUrl, consumerKey, consumerSecret } = credentials

    if (!siteUrl || !consumerKey || !consumerSecret) {
      throw new Error('WooCommerce API credentials are not properly configured')
    }

    this.client = axios.create()
    addOAuthInterceptor(this.client, {
      algorithm: 'HMAC-SHA1',
      key: consumerKey,
      secret: consumerSecret,
    })

    this.baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl
  }

  async searchProducts(searchTerm: string, perPage: number = 10): Promise<WooCommerceProduct[]> {
    try {
      const apiUrl = `${this.baseUrl}/wp-json/wc/v3/products`

      const response = await this.client.get(apiUrl, {
        params: {
          search: searchTerm,
          per_page: perPage,
        },
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`WooCommerce API Error: ${error.message}`)
      }
      throw error
    }
  }

  async getProductById(productId: string): Promise<WooCommerceProduct> {
    try {
      const apiUrl = `${this.baseUrl}/wp-json/wc/v3/products/${productId}`

      const response = await this.client.get(apiUrl)

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`WooCommerce API Error: ${error.message}`)
      }
      throw error
    }
  }
}
