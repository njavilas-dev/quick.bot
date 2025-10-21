import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'
import { GoogleSheetsAction } from '../constants'
import { ComparisonOperators } from '../../../logic/condition/constants'

export const getRowTemplate: { template: BlockTemplate } = {
  template: {
    blocks: [
      {
        type: BubbleBlockType.TEXT,
        content: {
          richText: [
            {
              type: 'p',
              children: [
                {
                  text: 'Enter your email',
                },
              ],
            },
          ],
        },
      },
      {
        type: InputBlockType.EMAIL,
        options: {
          variableId: '{{googleSheetEmailId}}',
          labels: {
            placeholder: 'your-email@example.com',
            button: 'Continue',
          },
        },
      },
      {
        type: IntegrationBlockType.GOOGLE_SHEETS,
        options: {
          action: GoogleSheetsAction.GET,
          totalRowsToExtract: 'First',
          cellsToExtract: [
            {
              id: 'cell-name',
              column: 'name',
              variableId: '{{googleSheetNameId}}',
            },
          ],
          filter: {
            comparisons: [
              {
                id: 'email-comparison',
                column: 'email',
                comparisonOperator: ComparisonOperators.EQUAL,
                value: '{{googleSheetEmail}}',
              },
            ],
          },
        },
      },
      {
        type: BubbleBlockType.TEXT,
        content: {
          richText: [
            {
              type: 'p',
              children: [
                {
                  text: 'Email: {{googleSheetEmail}}\nName: {{googleSheetName}}',
                },
              ],
            },
          ],
        },
      },
    ],
    variables: [
      {
        name: 'googleSheetName',
        value: '',
      },
      {
        name: 'googleSheetEmail',
        value: '',
      },
    ],
  },
}
