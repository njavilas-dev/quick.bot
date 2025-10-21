import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'
import { GoogleSheetsAction } from '../constants'

export const updateRowTemplate: { template: BlockTemplate } = {
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
        type: BubbleBlockType.TEXT,
        content: {
          richText: [
            {
              type: 'p',
              children: [
                {
                  text: 'Enter your new name',
                },
              ],
            },
          ],
        },
      },
      {
        type: InputBlockType.TEXT,
        options: {
          variableId: '{{googleSheetNameId}}',
          labels: {
            placeholder: 'Enter your new name',
            button: 'Continue',
          },
        },
      },

      {
        type: IntegrationBlockType.GOOGLE_SHEETS,
        options: {
          action: GoogleSheetsAction.UPDATE_ROW,
          cellsToUpsert: [
            {
              id: 'cell-name',
              column: 'name',
              value: '{{googleSheetName}}',
            },
            {
              id: 'cell-email',
              column: 'email',
              value: '{{googleSheetEmail}}',
            },
          ],
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
                  text: 'Answers updated: {{googleSheetEmail}} - {{googleSheetName}}.',
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
