import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'

export const wordpressSigninTemplate: { template: BlockTemplate } = {
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
                  text: 'Hi! its nice to meet you. Please create an account with us!',
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
          action: 'Register with WordPress',
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
                  text: 'Hi! {{wpUsername}}, nice to meet you! ',
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
