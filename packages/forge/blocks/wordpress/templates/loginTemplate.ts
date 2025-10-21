import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'

export const wordpressLoginTemplate: { template: BlockTemplate } = {
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
                  text: 'Hi dear! please login whit your acount to have more info about you!',
                },
              ],
            },
          ],
        },
      },
      {
        type: InputBlockType.EMAIL,
        options: {
          variableId: '{{wpEmailId}}',
          labels: {
            placeholder: 'Type your email...',
          },
        },
      },
      {
        type: InputBlockType.TEXT,
        options: {
          variableId: '{{wpPasswordId}}',
          labels: {
            placeholder: 'Type your password...',
          },
        },
      },
      {
        type: 'wordpress' as any,
        options: {
          action: 'Login with WordPress',
          email: '{{wpEmail}}',
          password: '{{wpPassword}}',
          storeUsernameIn: '{{wpUsernameId}}',
          storeMessageIn: '{{wpMessageId}}',
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
                  text: '{{wpMessage}}',
                },
              ],
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
                  text: 'Hi! {{wpUsername}}, nice to see you again! ',
                },
              ],
            },
          ],
        },
      },
    ],
    variables: [
      {
        name: 'wpUsername',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'wpMessage',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'wpPassword',
        value: '',
        isSavedVariable: false,
        isSecretVariable: true,
      },
      {
        name: 'wpEmail',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
    ],
  },
}
