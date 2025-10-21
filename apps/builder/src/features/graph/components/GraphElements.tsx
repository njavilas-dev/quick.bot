import { Edge, GroupV6, TEvent } from '@quickbot.io/schemas'
import { TotalAnswers, TotalVisitedEdges } from '@quickbot.io/schemas/features/analytics'
import React, { memo } from 'react'
import { EndpointsProvider } from '../providers/EndpointsProvider'
import { Edges } from './edges/Edges'
import { GroupNode } from './nodes/group/GroupNode'
import { EventNode } from './nodes/event'

type GraphElementsProps = {
  edges: Edge[]
  groups: GroupV6[]
  events: TEvent[]
  totalVisitedEdges?: TotalVisitedEdges[]
  totalAnswers?: TotalAnswers[]
}
const GroupNodes = ({ edges, groups, events, totalVisitedEdges, totalAnswers }: GraphElementsProps) => {
  return (
    <EndpointsProvider>
      <Edges edges={edges} groups={groups} />
      {events.map((event, idx) => (
        <EventNode event={event} key={event.id} eventIndex={idx} />
      ))}
      {groups.map((group, idx) => (
        <GroupNode
          group={group}
          groupIndex={idx}
          key={group.id}
          totalVisitedEdges={totalVisitedEdges}
          totalAnswers={totalAnswers}
        />
      ))}
    </EndpointsProvider>
  )
}

export default memo(GroupNodes)
