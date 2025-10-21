import { BotV6 } from '@quickbot.io/schemas'
import { BlockSource } from '@quickbot.io/schemas'

export type EndpointPosition = 'left' | 'right'

export const getEndpointPosition = (
  bot: BotV6 | undefined,
  source: BlockSource,
  groupId: string,
): EndpointPosition => {
  if (!bot?.edges) return 'right'

  // Find all edges that start from this source
  const outgoingEdges = bot.edges.filter(
    (edge) =>
      'blockId' in edge.from &&
      edge.from.blockId === source.blockId &&
      edge.from.itemId === source.itemId,
  )

  if (outgoingEdges.length === 0) return 'right'

  // Get target group coordinates for all outgoing edges
  const targetGroups = outgoingEdges.map((edge) => edge.to.groupId)
  const sourceGroup = bot.groups.find((g) => g.id === groupId)

  if (!sourceGroup) return 'right'

  // Count how many connections go to the left vs right
  let leftConnections = 0
  let rightConnections = 0

  targetGroups.forEach((targetGroupId) => {
    const targetGroup = bot.groups.find((g) => g.id === targetGroupId)
    if (targetGroup && targetGroup.id !== sourceGroup.id) {
      // Use actual coordinates to determine direction
      // If target group is to the left of source group, count as left connection
      if (targetGroup.graphCoordinates.x < sourceGroup.graphCoordinates.x) {
        leftConnections++
      } else {
        rightConnections++
      }
    }
  })

  // Return the dominant direction, defaulting to right if equal
  return leftConnections > rightConnections ? 'left' : 'right'
}
