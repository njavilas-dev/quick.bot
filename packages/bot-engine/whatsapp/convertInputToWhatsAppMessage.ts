import { ButtonItem, ContinueChatResponse } from '@quickbot.io/schemas'
import { WhatsAppSendingMessage } from '@quickbot.io/schemas/features/whatsapp'
import { isDefined, isEmpty } from '@quickbot.io/lib/utils'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { defaultChoiceInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/choice/constants'
import { convertRichTextToMarkdown } from '@quickbot.io/lib/markdown/convertRichTextToMarkdown'
import { env } from '@quickbot.io/env'

export const convertInputToWhatsAppMessages = async (
  input: NonNullable<ContinueChatResponse['input']>,
  lastMessage: ContinueChatResponse['messages'][number] | undefined,
  botSettings?: string,
): Promise<WhatsAppSendingMessage[]> => {
  const lastMessageText =
    lastMessage?.type === BubbleBlockType.TEXT && lastMessage.content.type === 'richText'
      ? convertRichTextToMarkdown(lastMessage.content.richText ?? [], {
          flavour: 'whatsapp',
        })
      : undefined
  switch (input.type) {
    case InputBlockType.DATE:
    case InputBlockType.EMAIL:
    case InputBlockType.FILE:
    case InputBlockType.NUMBER:
    case InputBlockType.PHONE:
    case InputBlockType.URL:
    case InputBlockType.PAYMENT:
    case InputBlockType.RATING:
    case InputBlockType.TEXT:
      return []
    case InputBlockType.CHOICE: {
      if (
        (input.options?.isMultipleChoice ?? defaultChoiceInputOptions.isMultipleChoice) &&
        botSettings
      ) {
        const settings = JSON.parse(botSettings)
        const flowId = settings.whatsApp?.flowIds?.multipleChoiceFlow
        if (!flowId) {
          console.error('Flow ID for multipleChoiceFlow not found in bot settings')
          return []
        }

        return [
          {
            type: 'interactive',
            interactive: {
              type: 'flow',
              header: {
                type: 'text',
                text:
                  input.options?.whatsappFlowHeader ?? defaultChoiceInputOptions.whatsappFlowHeader,
              },
              body: {
                text: input.options?.whatsappFlowBody ?? defaultChoiceInputOptions.whatsappFlowBody,
              },
              action: {
                name: 'flow',
                parameters: {
                  flow_message_version: '3',
                  flow_token: `choice_${input.id}_${Date.now()}`,
                  flow_id: flowId,
                  flow_cta:
                    input.options?.whatsappFlowButtonText ??
                    defaultChoiceInputOptions.whatsappFlowButtonText,
                  flow_action: 'navigate',
                  flow_action_payload: {
                    screen: 'multiple_choice_form',
                    data: {
                      options: input.items.map((item) => ({
                        id: item.id,
                        title: item.content || '',
                      })),
                      button_label:
                        input.options?.buttonLabel ?? defaultChoiceInputOptions.buttonLabel,
                      is_searchable:
                        input.options?.isSearchable ?? defaultChoiceInputOptions.isSearchable,
                      block_id: input.id,
                      question_label:
                        input.options?.whatsappFlowQuestionLabel ??
                        defaultChoiceInputOptions.whatsappFlowQuestionLabel,
                    },
                  },
                },
              },
            },
          },
        ]
      }
      const items = groupArrayByArraySize(
        input.items.filter((item) => isDefined(item.content)),
        env.WHATSAPP_INTERACTIVE_GROUP_SIZE,
      ) as ButtonItem[][]
      return items.map((items, idx) => ({
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: idx === 0 ? lastMessageText ?? '...' : '...',
          },
          action: {
            buttons: items.map((item) => ({
              type: 'reply',
              reply: {
                id: item.id,
                title: trimTextTo20Chars(item.content as string),
              },
            })),
          },
        },
      }))
    }
  }
}

const trimTextTo20Chars = (text: string): string =>
  text.length > 20 ? `${text.slice(0, 18)}..` : text

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const groupArrayByArraySize = (arr: any[], n: number) =>
  arr.reduce((r, e, i) => (i % n ? r[r.length - 1].push(e) : r.push([e])) && r, [])
