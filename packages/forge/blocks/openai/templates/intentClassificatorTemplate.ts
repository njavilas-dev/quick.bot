import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { ComparisonOperators } from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'

export const intentClassificatorTemplate: { template: BlockTemplate } = {
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
                  text: 'Hi there! 👋 How can I help you today?',
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
            placeholder: 'Tell me what you need help with...',
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
              content: '### Instructions\nClassify the conversation into exactly one intention by calling the `predictUserIntention` tool.\nDo not output any other content besides the tool call.\n\n### User intentions ###\n\n**Unknow**: The user intent is ambiguous or not sufficiently clear to be classified into the above categories. These queries may require additional context, review, or follow-up to determine the appropriate classification accurately.\n**Sales**: The user demonstrate a clear interest in exploring, inquiring, or intending to purchase products or services. It involve requests for information about product features, pricing, availability, or the purchase process.\n**Support**: The user is seeking assistance, troubleshooting, or solutions for any issues they are encountering with products or services. This includes requests for technical support, guidance on product usage, or help with resolving service-related problems.\n**Closure**: The user expresses a desire to conclude the conversation. The user has no further questions, is satisfied with the assistance provided, or simply wishes to end the interaction.\n**Ban**: The user exhibits disruptive behavior or demonstrates a clear lack of constructive intent, which is significantly negative or harmful and may justify considering restrictions or banning the user from the service.',
            },
            {
              role: 'user',
              content: '{{varUserMessage}}',
            },
          ],
          tools: [
            {
              type: 'function',
              name: 'predicUserIntention',
              description: 'Predict the user intention for a given conversation',
              parameters: [
                {
                  type: 'enum',
                  values: ['Unknow', 'Sales', 'Support', 'Closure', 'Ban'],
                  name: 'prediction',
                  description: 'The predicted user intention.',
                  required: true,
                },
              ],
              code: 'return prediction;',
            },
          ],
          temperature: 1,
          responseMapping: [
            {
              variableId: '{{varMessageContentId}}',
            },
            {
              item: 'Total tokens',
              variableId: '{{varTotalTokensId}}',
            },
            {
              item: 'Tool results',
              variableId: '{{varToolResultsId}}',
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
                  text: '🧠 User intention classified as: ',
                },
                {
                  bold: true,
                  color: '#3182ce',
                  text: '{{varToolResults}}',
                },
              ],
            },
            {
              type: 'p',
              children: [
                {
                  text: '⚡ You can delete this message block - it\'s just to show you the classification result during testing.',
                  color: '#718096',
                  italic: true,
                },
              ],
            },
          ],
        },
      },
      {
        type: LogicBlockType.CONDITION,
        items: [
          {
            id: 'unknow-condition',
            content: {
              comparisons: [
                {
                  id: 'unknow-comparison',
                  variableId: '{{varToolResultsId}}',
                  comparisonOperator: ComparisonOperators.EQUAL,
                  value: 'Unknow',
                },
              ],
            },
          },
          {
            id: 'sales-condition',
            content: {
              comparisons: [
                {
                  id: 'sales-comparison',
                  variableId: '{{varToolResultsId}}',
                  comparisonOperator: ComparisonOperators.EQUAL,
                  value: 'Sales',
                },
              ],
            },
          },
          {
            id: 'support-condition',
            content: {
              comparisons: [
                {
                  id: 'support-comparison',
                  variableId: '{{varToolResultsId}}',
                  comparisonOperator: ComparisonOperators.EQUAL,
                  value: 'Support',
                },
              ],
            },
          },
          {
            id: 'closure-condition',
            content: {
              comparisons: [
                {
                  id: 'closure-comparison',
                  variableId: '{{varToolResultsId}}',
                  comparisonOperator: ComparisonOperators.EQUAL,
                  value: 'Closure',
                },
              ],
            },
          },
          {
            id: 'ban-condition',
            content: {
              comparisons: [
                {
                  id: 'ban-comparison',
                  variableId: '{{varToolResultsId}}',
                  comparisonOperator: ComparisonOperators.EQUAL,
                  value: 'Ban',
                },
              ],
            },
          },
        ],
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
      {
        name: 'varTotalTokens',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'varToolResults',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
    ],
  },
}