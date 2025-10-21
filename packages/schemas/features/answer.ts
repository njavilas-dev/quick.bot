import { z } from '../zod'

export const answerSchema = z.object({
  blockId: z.string(),
  content: z.string(),
  attachedFileUrls: z.array(z.string()).optional(),
})

export const answerInputSchema = z.object({
  blockId: z.string(),
  groupId: z.string(),
  content: z.string(),
})

export const statsSchema = z.object({
  totalViews: z.number(),
  totalStarts: z.number(),
  totalCompleted: z.number(),
})

export type Stats = z.infer<typeof statsSchema>

export type Answer = z.infer<typeof answerSchema>

export type AnswerInput = z.infer<typeof answerInputSchema>
