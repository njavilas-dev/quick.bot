import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'

export const woocommerceTemplate: { template: BlockTemplate } = {
  template: {
    blocks: [
      {
        type: BubbleBlockType.TEXT,
        content: {
          richText: [{ type: 'p', children: [{ text: 'What product are you looking for?' }] }],
        },
      },
      {
        type: InputBlockType.TEXT,
        options: {
          variableId: '{{wooSearchTermId}}',
          labels: {
            placeholder: 'Enter product name...',
            button: 'Search',
          },
        },
      },
      {
        type: 'woocommerce' as any,
        options: {
          action: 'Search Products',
          searchTerm: '{{wooSearchTerm}}',
          outputVariableId: '{{wooSearchResultsId}}',
          outputDataVariableId: '{{wooSearchResultsDataId}}',
          perPage: 10,
          formatType: 'list',
          includeLinks: true,
          includePrices: true,
        },
      },
      {
        type: BubbleBlockType.TEXT,
        content: {
          richText: [{ type: 'p', children: [{ text: '{{wooSearchResults}}' }] }],
        },
      },
    ],
    variables: [
      {
        name: 'wooSearchTerm',
        value: '',
      },
      {
        name: 'wooSearchResults',
        value: '',
      },
      {
        name: 'wooSearchResultsData',
        value: '',
      },
    ],
  },
}
