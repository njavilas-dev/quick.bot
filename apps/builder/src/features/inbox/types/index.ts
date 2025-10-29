import { z } from 'zod'

export const chatMessageBaseSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  blockId: z.string().optional(),
  groupId: z.string().optional(),
})

export const botChatMessageSchema = chatMessageBaseSchema.extend({
  type: z.literal('bot'),
  content: z.string(),
  blockType: z.string(),
  richContent: z.any().optional(),
  block: z.any().optional(),
})

export const userChatMessageSchema = chatMessageBaseSchema.extend({
  type: z.literal('user'),
  content: z.string(),
  attachedFileUrls: z.array(z.string()).optional(),
})

export const chatMessageSchema = z.discriminatedUnion('type', [
  botChatMessageSchema,
  userChatMessageSchema,
])

export type ChatMessageBase = z.infer<typeof chatMessageBaseSchema>
export type BotChatMessage = z.infer<typeof botChatMessageSchema>
export type UserChatMessage = z.infer<typeof userChatMessageSchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>

export * from './message.types'
