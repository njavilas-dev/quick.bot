import { RatingInputBlock } from '@quickbot.io/schemas'
import { defaultRatingInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/rating/constants'

export const validateRatingReply = (reply: string, block: RatingInputBlock) =>
  Number(reply) <= (block.options?.length ?? defaultRatingInputOptions.length)
