import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'

export const getTicketTypesTemplate: { template: BlockTemplate } = {
  template: {
    blocks: [
      {
        type: 'freshdesk' as any,
        options: {
          action: 'Get Ticket Types',
          stringOutputVariableId: '{{fdTicketTypesId}}',
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
                  bold: true,
                  text: 'Ticket types:',
                },
                {
                  text: '{{fdTicketTypes}}',
                },
              ],
            },
          ],
        },
      },
    ],
    variables: [
      {
        name: 'fdTicketTypes',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
    ],
  },
}
