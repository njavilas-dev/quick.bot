import { createAction, option } from '@quickbot.io/forge'
import { auth } from '../auth'
import { SearchProductsOptions } from '../types/product.types'
import { ApiService } from '../services/api.service'
import { ProductFormatterService } from '../services/product-formatter.service'

export const searchProducts = createAction({
  auth,
  name: 'Search Products',
  options: option.object({
    searchTerm: option.string.layout({
      label: 'Search Term',
      isRequired: true,
      withVariableButton: true,
      helperText: 'Enter a product name to search for',
    }),
    perPage: option.number.min(0).layout({
      label: 'Results Per Page',
      defaultValue: 10,
      helperText: 'Number of products to return (max 100)',
    }),
    outputVariableId: option.string.layout({
      label: 'Output Variable',
      helperText: 'Variable where the result will be saved',
      inputType: 'variableDropdown',
    }),
    outputDataVariableId: option.string.layout({
      label: 'Output Data Variable',
      helperText: 'Variable where the data result will be saved',
      inputType: 'variableDropdown',
    }),
    formatType: option.enum(['list', 'detail']).layout({
      label: 'Format Type',
      defaultValue: 'list',
      helperText: 'How to format the products',
    }),
    includeLinks: option.boolean.layout({
      label: 'Include Links',
      defaultValue: true,
      moreInfoTooltip: 'Include product permalinks as clickable links',
      direction: 'row',
    }),
    includePrices: option.boolean.layout({
      label: 'Include Prices',
      defaultValue: true,
      moreInfoTooltip: 'Show product prices in the output',
      direction: 'row',
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

      const {
        searchTerm,
        perPage,
        outputVariableId,
        outputDataVariableId,
        formatType,
        includeLinks,
        includePrices,
      } = options as SearchProductsOptions

      if (!searchTerm || !outputVariableId) {
        return logs.add({
          status: 'error',
          description: 'Required parameters are missing',
        })
      }

      try {
        const apiService = new ApiService({ siteUrl, consumerKey, consumerSecret })
        const formatterService = new ProductFormatterService()

        const products = await apiService.searchProducts(searchTerm, perPage || 10)

        if (!products || products.length === 0) {
          variables.set(outputVariableId, 'No products found.')
          logs.add({
            status: 'info',
            description: `No products found matching "${searchTerm}"`,
          })
          return
        }

        logs.add({
          status: 'success',
          description: `Found ${products.length} products matching "${searchTerm}"`,
        })

        const formattedText = formatterService.formatProducts(products, {
          formatType: formatType || 'list',
          includeLinks: includeLinks !== false,
          includePrices: includePrices !== false,
        })

        variables.set(outputVariableId, formattedText)
        variables.set(
          outputDataVariableId,
          products.map((product) => ({ value: product.id.toString(), title: product.name })),
        )
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

        console.error('WooCommerce Search Error:', error)
        variables.set(outputVariableId, 'There was an error when searching for products')

        logs.add({
          status: 'error',
          description: errorMessage,
        })
      }
    },
  },
})
