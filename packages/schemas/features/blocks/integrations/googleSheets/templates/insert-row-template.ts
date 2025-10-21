import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'
import { GoogleSheetsAction } from '../constants'

export const insertRowTemplate: { template: BlockTemplate } = {
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
                  text: 'Enter your name',
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
            placeholder: 'Enter your name',
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
          action: GoogleSheetsAction.INSERT_ROW,
          cellsToInsert: [
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
                  text: 'Answers saved: {{googleSheetEmail}} - {{googleSheetName}}.',
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
