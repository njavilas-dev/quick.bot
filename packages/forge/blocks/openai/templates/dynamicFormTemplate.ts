import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { ComparisonOperators } from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'

export const dynamicFormTemplate: { template: BlockTemplate } = {
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
                  text: 'Hi! 👋 I need to collect some information from you. Let\'s chat naturally and I\'ll gather your details as we talk.',
                },
              ],
            },
            {
              type: 'p',
              children: [
                {
                  text: 'I need your ',
                  italic: true,
                },
                {
                  text: 'name, email address, and physical address',
                  bold: true,
                  italic: true,
                },
                {
                  text: '. You can share them all at once or one by one - whatever feels comfortable!',
                  italic: true,
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
            placeholder: 'Type your message here...',
          },
        },
      },
      {
        type: LogicBlockType.SET_VARIABLE,
        options: {
          variableId: '{{varConversationHistoryId}}',
          type: 'Append value(s)' as any,
          item: '{{varUserMessage}}',
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
              content: `### Instructions
You are a friendly assistant collecting form data from users through natural conversation.

Your goal is to collect the following information:
1. **Full Name** - The user's complete name
2. **Email Address** - A valid email address
3. **Physical Address** - Complete address including street, city, state/province, and postal code

### CRITICAL: Review the conversation history to see what information has already been provided!

### Guidelines:
- Be conversational and friendly
- Look at the ENTIRE conversation history to see what data you already have
- If the user provides all information at once, extract everything
- If information is missing, politely ask ONLY for the missing fields
- DO NOT ask for information you already received in previous messages
- Validate that the email looks reasonable (has @ and a domain)
- Once you have ALL 3 fields, immediately call the \`captureUserData\` tool
- If the user provides partial information, acknowledge what you received and ask for what's missing
- Be helpful and guide the user naturally

### Examples:
User: "My name is John Doe"
Assistant: "Great to meet you, John! Now I'll need your email address and physical address to complete the form."

User: "I'm Jane Smith, email jane@example.com, I live at 123 Main St, New York, NY 10001"
Assistant: [Calls captureUserData] "Perfect! I've captured all your information."

Always be polite and make the user feel comfortable sharing their information.`,
            },
            {
              role: 'Dialogue',
              dialogueVariableId: '{{varConversationHistoryId}}',
              startsBy: 'user',
            },
          ],
          tools: [
            {
              type: 'function',
              name: 'captureUserData',
              description: 'Capture complete user data including name, email, and address. Only call this when you have ALL required fields.',
              parameters: [
                {
                  type: 'string',
                  name: 'fullName',
                  description: 'The complete name of the user',
                  required: true,
                },
                {
                  type: 'string',
                  name: 'email',
                  description: 'A valid email address',
                  required: true,
                },
                {
                  type: 'string',
                  name: 'address',
                  description: 'Complete physical address including street, city, state/province, and postal code',
                  required: true,
                },
              ],
              code: `// Return the captured data as a structured object
return JSON.stringify({
  fullName,
  email,
  address,
  capturedAt: new Date().toISOString()
});`,
            },
          ],
          temperature: 0.7,
          responseMapping: [
            {
              variableId: '{{varAssistantResponseId}}',
            },
            {
              item: 'Total tokens',
              variableId: '{{varTotalTokensId}}',
            },
            {
              item: 'Tool results',
              variableId: '{{varCapturedDataId}}',
            },
          ],
        },
      },
      {
        type: LogicBlockType.SET_VARIABLE,
        options: {
          variableId: '{{varConversationHistoryId}}',
          type: 'Append value(s)' as any,
          item: '{{varAssistantResponse}}',
        },
      },
      {
        type: LogicBlockType.CONDITION,
        items: [
          {
            id: 'data-captured-condition',
            content: {
              comparisons: [
                {
                  id: 'data-captured-comparison',
                  variableId: '{{varCapturedDataId}}',
                  comparisonOperator: ComparisonOperators.IS_EMPTY,
                },
              ],
            },
          },
        ],
      },
      {
        type: BubbleBlockType.TEXT,
        content: {
          richText: [
            {
              type: 'p',
              children: [
                {
                  text: '{{varAssistantResponse}}',
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
                  text: '✅ Data captured test 2!',
                  bold: true,
                  color: '#22c55e',
                },
              ],
            },
            {
              type: 'p',
              children: [
                {
                  text: '',
                },
              ],
            },
            {
              type: 'p',
              children: [
                {
                  text: '{{varCapturedData}}',
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
        name: 'varAssistantResponse',
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
        name: 'varCapturedData',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'varConversationHistory',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
    ],
    edges: [
      {
        // Loop back from condition to text input for continued conversation
        fromBlockIndex: 5, // Condition block
        fromItemId: 'data-captured-condition',
        toBlockIndex: 1, // Text input block (creates conversational loop)
      },
    ],
  },
}
