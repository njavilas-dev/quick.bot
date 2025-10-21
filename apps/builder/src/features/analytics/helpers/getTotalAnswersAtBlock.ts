import { byId } from '@quickbot.io/lib'
import { PublicBotV6 } from '@quickbot.io/schemas'
import { TotalAnswers } from '@quickbot.io/schemas/features/analytics'

/**
 * Gets the total responses for a specific block.
 * Returns 0 if the block is not found (consistent handling with computeTotalUsersAtBlock).
 */
export const getTotalAnswersAtBlock = (
  currentBlockId: string,
  {
    publishedBot,
    totalAnswers,
  }: {
    publishedBot: PublicBotV6;
    totalAnswers: TotalAnswers[];
  },
): number => {
  const block = publishedBot.groups
    .flatMap((g) => g.blocks)
    .find(byId(currentBlockId));
  
  // Consistent handling: returns 0 instead of throwing exception
  if (!block) return 0;
  
  return totalAnswers.find((t) => t.blockId === block.id)?.total ?? 0;
};