import { BotV6 } from '@quickbot.io/schemas'
import { TEventSource } from '@quickbot.io/schemas'

export type EndpointPosition = 'left' | 'right'

export const getEventEndpointPosition = (
  bot: BotV6 | undefined,
  source: TEventSource,
): EndpointPosition => {
  if (!bot?.edges) return 'right'

  // Find all edges that start from this event
  const outgoingEdges = bot.edges.filter(
    (edge) => 'eventId' in edge.from && edge.from.eventId === source.eventId,
  )

  if (outgoingEdges.length === 0) return 'right'

  // Get target group coordinates for all outgoing edges
  const targetGroups = outgoingEdges.map((edge) => edge.to.groupId)

  // Get the source event coordinates
  const sourceEvent = bot.events?.find((e) => e.id === source.eventId)
  if (!sourceEvent) return 'right'

  // Count how many connections go to the left vs right
  let leftConnections = 0
  let rightConnections = 0

  targetGroups.forEach((targetGroupId) => {
    const targetGroup = bot.groups.find((g) => g.id === targetGroupId)
    if (targetGroup) {
      // Use actual coordinates to determine direction
      // If target group is to the left of source event, count as left connection
      if (targetGroup.graphCoordinates.x < sourceEvent.graphCoordinates.x) {
        leftConnections++
      } else {
        rightConnections++
      }
    }
  })

  // Return the dominant direction, defaulting to right if equal
  return leftConnections > rightConnections ? 'left' : 'right'
}
