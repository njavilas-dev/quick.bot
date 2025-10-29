import { Variable, ContinueChatResponse } from '@quickbot.io/schemas'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import type { TDescendant } from '@udecode/plate-common'

const computePlainText = (elements: TDescendant[]): string =>
  elements
    .map((element) => element.text ?? computePlainText(element.children as TDescendant[]))
    .join('')

export const updateConversation = (
  variables: Variable[],
  role: 'bot' | 'user',
  message: string,
): Variable[] => {
  const conversationVariable = variables.find((v) => v.id === 'system_conversation')
  if (!conversationVariable) return variables

  const currentConversation = (conversationVariable.value as string) || ''
  const roleLabel = role === 'bot' ? 'Assistant' : 'User'
  const newEntry = `${roleLabel}: "${message}"`
  const updatedConversation = currentConversation ? `${currentConversation}\n${newEntry}` : newEntry

  return variables.map((v) =>
    v.id === 'system_conversation' ? { ...v, value: updatedConversation } : v,
  )
}

export const extractMessageText = (message: ContinueChatResponse['messages'][0]): string | null => {
  switch (message.type) {
    case BubbleBlockType.TEXT: {
      if (message.content.type === 'richText') {
        try {
          return computePlainText(message.content.richText as TDescendant[])
        } catch (error) {
          console.error('Error extracting text from richText:', error)
          return null
        }
      }
      return message.content.markdown
    }
    case BubbleBlockType.IMAGE: {
      return message.content.url ?? null
    }
    case BubbleBlockType.VIDEO: {
      return message.content.url ?? null
    }
    case BubbleBlockType.AUDIO: {
      return message.content.url ?? null
    }
    case BubbleBlockType.EMBED:
    case 'custom-embed': {
      return null
    }
  }
}
