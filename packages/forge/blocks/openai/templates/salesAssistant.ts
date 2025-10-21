import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'

export const salesAssistant: { template: BlockTemplate } = {
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
                  text: 'Hello! I\'m your professional sales assistant. I\'m here to help you find the perfect products or services for your needs. What can I help you with today?',
                },
              ],
            },
          ],
        },
      },
      {
        type: InputBlockType.TEXT,
        options: {
          variableId: '{{varUserMessageId}}',
          labels: {
            placeholder: 'Tell me about your needs or ask any question...',
          },
        },
      },
      {
        type: 'openai' as any,
        options: {
          action: 'Create chat completion',
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a professional and empathetic sales assistant. Your goal is to engage in conversation with the user, understand their needs, recommend products or services in a clear and persuasive way, and guide them towards making a purchase. Speak in a friendly and trustworthy tone, use positive language, and avoid unnecessary technical jargon. Ask open-ended questions to identify the customer\'s budget, goals, and concerns. If the customer has objections, address them by highlighting benefits and solutions. Always aim to move the conversation toward the next step (requesting a demo, scheduling a call, or completing a purchase).',
            },
            {
              role: 'user',
              content: '{{varUserMessage}}',
            },
          ],
          tools: [],
          temperature: 1,
          responseMapping: [
            {
              variableId: '{{varMessageContentId}}',
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
                  bold: true,
                  italic: true,
                  text: '{{varMessageContent}}',
                },
              ],
            },
          ],
        },
      },
    ],
    variables: [
      {
        name: 'varUserMessage',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'varMessageContent',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
    ],
  },
}