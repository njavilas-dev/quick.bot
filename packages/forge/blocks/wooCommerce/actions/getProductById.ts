import { createAction, option } from '@quickbot.io/forge'
import { auth } from '../auth'
import { ApiService } from '../services/api.service'
import { ProductFormatterService } from '../services/product-formatter.service'

export const getProductById = createAction({
  auth,
  name: 'Get Product By ID',
  options: option.object({
    productId: option.string.layout({
      label: 'Product ID',
      isRequired: true,
      withVariableButton: true,
      helperText: 'Enter the product ID to retrieve',
    }),
    outputVariableId: option.string.layout({
      label: 'Output Variable',
      helperText: 'Variable where the result will be saved',
      inputType: 'variableDropdown',
    }),
    includeLinks: option.boolean.layout({
      direction: 'row',
      label: 'Include Links',
      defaultValue: true,
      moreInfoTooltip: 'Include product permalinks as clickable links',
    }),
    includePrices: option.boolean.layout({
      direction: 'row',
      label: 'Include Prices',
      defaultValue: true,
      moreInfoTooltip: 'Show product prices in the output',
    }),
  }),
  run: {
    server: async ({ credentials, options, variables, logs }) => {
      const { siteUrl, consumerKey, consumerSecret } = credentials
      if (!siteUrl || !consumerKey || !consumerSecret) {
        return logs.add({
          status: 'error',
          description: 'WooCommerce API credentials are not properly configured',
        })
      }

      const { productId, outputVariableId, includeLinks, includePrices } = options

      if (!productId || !outputVariableId) {
        return logs.add({
          status: 'error',
          description: 'Required parameters are missing',
        })
      }

      try {
        const apiService = new ApiService({ siteUrl, consumerKey, consumerSecret })
        const formatterService = new ProductFormatterService()

        const product = await apiService.getProductById(productId)

        if (!product) {
          variables.set(outputVariableId, 'Product not found.')
          logs.add({
            status: 'info',
            description: `Product with ID "${productId}" not found`,
          })
          return
        }

        logs.add({
          status: 'success',
          description: `Found product: "${product.name}" (ID: ${productId})`,
        })

        const formattedText = formatterService.formatProducts([product], {
          formatType: 'detail',
          includeLinks: includeLinks !== false,
          includePrices: includePrices !== false,
        })

        variables.set(outputVariableId, formattedText)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

        console.error('WooCommerce Get Product Error:', error)
        variables.set(outputVariableId, 'There was an error when retrieving the product')

        logs.add({
          status: 'error',
          description: errorMessage,
        })
      }
    },
  },
})
