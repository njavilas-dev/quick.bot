export interface Message {
  id: string
  type: 'user' | 'bot'
  content?: string
  blockType?: string
  timestamp: Date
  attachedFileUrls?: string[]
  richContent?: unknown
  block?: unknown
  groupId?: string
  blockId?: string
}

export type MediaType = 'image' | 'video' | 'audio' | null

export type BubbleVariant = 'host' | 'guest'
