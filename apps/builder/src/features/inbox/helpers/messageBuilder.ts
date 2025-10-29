import type { Block, Variable } from '@quickbot.io/schemas'
import type { BotChatMessage, UserChatMessage } from '../types'
import { getBlockDisplayContent } from './blockContentExtractor'
import { isFileInputBlock } from './blockTypeCheckers'
import { parseVariables } from '@quickbot.io/variables/parseVariables'
import { parseVariablesInRichText } from '@quickbot.io/bot-engine/parseBubbleBlock'

export interface Answer {
  blockId: string
  groupId: string
  value: string
  variableId?: string | null
}

export class MessageBuilder {
  private messages: Array<BotChatMessage | UserChatMessage> = []
  private messageIndex = 0

  constructor(private baseTimestamp: Date) {}

  addBotMessage(block: Block, variables: Variable[], groupId?: string): void {
    const rawContent = getBlockDisplayContent(block)
    if (!rawContent) return

    const content = parseVariables(variables)(rawContent)

    let richContent = undefined
    if ('content' in block && block.content && typeof block.content === 'object') {
      if ('richText' in block.content && Array.isArray(block.content.richText)) {
        const { parsedElements } = parseVariablesInRichText(block.content.richText, {
          variables,
          takeLatestIfList: true,
        })
        richContent = parsedElements
      }
    }

    const timestamp = new Date(this.baseTimestamp.getTime() + this.messageIndex * 1000)

    this.messages.push({
      id: `bot-${block.id}-${this.messageIndex}`,
      type: 'bot',
      content,
      blockId: block.id,
      blockType: block.type,
      timestamp,
      groupId,
      richContent,
      block,
    })

    this.messageIndex++
  }

  addUserMessage(answer: Answer, block: Block): void {
    const timestamp = new Date(this.baseTimestamp.getTime() + this.messageIndex * 1000)

    const { content, attachedFileUrls } = this.parseAnswerContent(answer.value, block.type)

    this.messages.push({
      id: `user-${block.id}-${this.messageIndex}`,
      type: 'user',
      content,
      blockId: block.id,
      timestamp: new Date(timestamp.getTime() + 500),
      attachedFileUrls: attachedFileUrls.length > 0 ? attachedFileUrls : undefined,
    })

    this.messageIndex++
  }

  private parseAnswerContent(
    value: string,
    blockType: string,
  ): { content: string; attachedFileUrls: string[] } {
    if (!isFileInputBlock(blockType)) {
      return { content: value, attachedFileUrls: [] }
    }

    const urlPattern = /https?:\/\/[^\s]+/g
    const urls = value.match(urlPattern)

    if (urls && urls.length > 0) {
      // Filter URLs that are prefixes of others (same file with partial name)
      const uniqueUrls = urls.filter((url, index, self) => {
        // Keep only the longest URL when there are URLs that are prefixes of others
        return !self.some((otherUrl, otherIndex) =>
          otherIndex !== index &&
          otherUrl.startsWith(url) &&
          otherUrl.length > url.length
        )
      })

      return {
        content: '',
        attachedFileUrls: [...new Set(uniqueUrls)],
      }
    }

    return { content: value, attachedFileUrls: [] }
  }

  build(): Array<BotChatMessage | UserChatMessage> {
    return this.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  count(): number {
    return this.messages.length
  }
}
