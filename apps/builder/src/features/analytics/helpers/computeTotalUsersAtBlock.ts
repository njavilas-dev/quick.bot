import { isNotDefined } from '@quickbot.io/lib'
import { PublicBotV6 } from '@quickbot.io/schemas'
import { isInputBlock } from '@quickbot.io/schemas/helpers'
import { TotalAnswers, TotalVisitedEdges } from '@quickbot.io/schemas/features/analytics'
import type { Block, Group, Edge } from '@quickbot.io/schemas'
import { findGroupContainingBlock } from './blockHelpers'

/**
 * Calculates the total number of users who have reached a specific block.
 * This function is part of the drop-off analysis system (user loss)
 * that allows determining how many users have been lost at each step of the bot.
 * 
 * The calculation sums two types of users:
 * 
 * 1. **Users from previous blocks (same group)**:
 *    - Were already within the current group
 *    - Followed the sequential flow: Block A → Block B → Target block
 *    - Represent flow continuity within the same group
 *    - Example: User completes form → sees confirmation → reaches final block
 * 
 * 2. **Users from direct connections to the group**:
 *    - Come from other groups or external points
 *    - Jumped directly to the group without passing through previous blocks of the same group
 *    - Represent external entry points to the flow
 *    - Example: User comes from Group A → jumps directly to Group B
 * 
 * In the context of drop-off analysis:
 * - Users from previous blocks = retention within the group (internal flow)
 * - Users from direct connections = incoming traffic from other flows (external flow)
 */
export const computeTotalUsersAtBlock = (
  targetBlockId: string,
  {
    publishedBot,
    totalVisitedEdges,
    totalAnswers,
  }: {
    publishedBot: PublicBotV6
    totalVisitedEdges: TotalVisitedEdges[]
    totalAnswers: TotalAnswers[]
  },
): number => {
  const blockGroup = findGroupContainingBlock(publishedBot, targetBlockId)
  if (!blockGroup) return 0

  const usersFromPreviousBlocks = calculateUsersFromPreviousBlocks(
    targetBlockId,
    blockGroup,
    publishedBot,
    totalVisitedEdges,
    totalAnswers
  )

  const usersFromGroupConnections = calculateUsersFromGroupConnections(
    blockGroup,
    publishedBot,
    totalVisitedEdges
  )

  return usersFromPreviousBlocks + usersFromGroupConnections
}

// Function moved to blockHelpers.ts to avoid duplication

/**
 * Calculates users who arrived from previous blocks in the same group.
 * 
 * INTERNAL FLOW: These are users who were already within the group and followed
 * the sequential block flow. They represent continuity and retention within the group.
 * 
 * Traverses blocks from the target backwards to find the entry point.
 * If it finds a previous input block, uses its responses as the calculation base
 * (more accurate than counting edge visitors to measure drop-off).
 */
function calculateUsersFromPreviousBlocks(
  targetBlockId: string,
  blockGroup: Group,
  publishedBot: PublicBotV6,
  totalVisitedEdges: TotalVisitedEdges[],
  totalAnswers: TotalAnswers[]
): number {
  const targetBlockIndex = blockGroup.blocks.findIndex((block) => block.id === targetBlockId)
  // Gets all blocks from the beginning to the target block (inclusive)
  const blocksUpToTarget = blockGroup.blocks.slice(0, targetBlockIndex + 1)
  let totalUsersFromBlocks = 0

  // Traverses blocks in reverse order to find the user flow
  for (const block of blocksUpToTarget.reverse()) {
    // If we find a previous input block, we use its responses as the base metric
    // This is more accurate than counting edge visitors to measure drop-off
    if (shouldReturnAnswersFromPreviousInputBlock(targetBlockId, block)) {
      return getTotalAnswersForBlock(block.id, totalAnswers)
    }

    // Sum users who reached this block through edges
    const usersFromIncomingEdges = calculateUsersFromIncomingEdges(
      block.id,
      publishedBot,
      totalVisitedEdges
    )
    totalUsersFromBlocks += usersFromIncomingEdges
  }

  return totalUsersFromBlocks
}

/**
 * Determines whether to use responses from a previous input block.
 * Input blocks are better indicators of active users for drop-off analysis.
 */
function shouldReturnAnswersFromPreviousInputBlock(targetBlockId: string, block: Block): boolean {
  return targetBlockId !== block.id && isInputBlock(block)
}

function getTotalAnswersForBlock(blockId: string, totalAnswers: TotalAnswers[]): number {
  return totalAnswers.find((answer) => answer.blockId === blockId)?.total ?? 0
}

/**
 * Calculates users who reached a specific block through edges.
 * Sums all visits from edges that point to this block.
 */
function calculateUsersFromIncomingEdges(
  blockId: string,
  publishedBot: PublicBotV6,
  totalVisitedEdges: TotalVisitedEdges[]
): number {
  const incomingEdges = publishedBot.edges.filter((edge) => edge.to.blockId === blockId)
  if (!incomingEdges.length) return 0

  return sumEdgeVisits(incomingEdges, totalVisitedEdges)
}

/**
 * Calculates users who arrived directly to the group (not to a specific block).
 * 
 * EXTERNAL FLOW: These are users who come from other groups or external points
 * and jumped directly to this group without passing through previous blocks of the same group.
 * They represent incoming traffic from other flows.
 * 
 * These edges point to the group in general, typically from other groups.
 * It's important for measuring users who enter the flow from external points
 * and distinguish between internal retention vs incoming traffic.
 */
function calculateUsersFromGroupConnections(
  blockGroup: Group,
  publishedBot: PublicBotV6,
  totalVisitedEdges: TotalVisitedEdges[]
): number {
  // Search for edges that point to the group but not to a specific block
  const edgesConnectedToGroup = publishedBot.edges.filter(
    (edge) => edge.to.groupId === blockGroup.id && isNotDefined(edge.to.blockId)
  )

  return sumEdgeVisits(edgesConnectedToGroup, totalVisitedEdges)
}

/**
 * Sums the total visits from a list of edges.
 * Searches for each edge in the statistics and sums their total visits.
 * Includes validations for inconsistent data.
 */
function sumEdgeVisits(edges: Edge[], totalVisitedEdges: TotalVisitedEdges[]): number {
  if (!edges.length || !totalVisitedEdges.length) return 0
  
  return edges.reduce(
    (accumulator, edge) => {
      if (!edge?.id) return accumulator // Validate that the edge has an ID
      
      const edgeVisits = totalVisitedEdges.find((totalEdge) => totalEdge.edgeId === edge.id)?.total ?? 0
      
      // Validate that visits are a valid and non-negative number
      const validVisits = Math.max(0, Number(edgeVisits) || 0)
      
      return accumulator + validVisits
    },
    0
  )
}
