import { Editable, EditableInput, EditablePreview, Stack } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import { GroupV6 } from '@quickbot.io/schemas'
import { TotalAnswers, TotalVisitedEdges } from '@quickbot.io/schemas/features/analytics'
import { BlockNodesList } from '../block/BlockNodesList'
import { isEmpty, isNotDefined } from '@quickbot.io/lib'
import { GroupNodeContextMenu } from './GroupNodeContextMenu'
import { ContextMenu } from '@/components/ContextMenu'
import { useDrag } from '@use-gesture/react'
import { GroupActionsBar } from './GroupActionsBar'
import { useEditor } from '@/features/editor/providers/EditorProvider'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useBlockDnd } from '@/features/graph/providers/GraphDragAndDropProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { setMultipleRefs } from '@/helpers/setMultipleRefs'
import { groupWidth } from '@/features/graph/constants'
import {
  useGraphGroups,
  useGroupCoordinates,
  useIsGroupFocused,
} from '@/features/graph/hooks/useGraphGroups'
import { getNodeOutline } from '@/features/graph/helpers/nodeStates'
import { useNodeState } from '@/features/graph/hooks/useNodeState'
import { AnalyticsFloatingBar } from '@/components/AnalyticsFloatingBar'
import { useAnalyticsActions } from '@/hooks/useAnalyticsActions'

type Props = {
  group: GroupV6
  groupIndex: number
  totalVisitedEdges?: TotalVisitedEdges[]
  totalAnswers?: TotalAnswers[]
}

export const GroupNode = ({
  group,
  groupIndex,
  totalVisitedEdges = [],
  totalAnswers = [],
}: Props) => {
  const { connectingIds, setConnectingIds, isReadOnly, graphPosition, loopHighlight, isAnalytics } =
    useGraph()
  const { bot, updateGroup, updateGroupsCoordinates } = useBot()
  const { setMouseOverGroup, mouseOverGroup } = useBlockDnd()
  const { setShowPreviewDrawer, setStartPreviewAtGroup } = useEditor()

  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isContextMenuOpened, setIsContextMenuOpened] = useState(false)
  const [groupTitle, setGroupTitle] = useState(group.title)

  const groupRef = useRef<HTMLDivElement | null>(null)
  const { isDraggingGraph, focusedGroups, moveFocusedGroups, focusGroup, getGroupsCoordinates } =
    useGraphGroups()
  const isFocused = useIsGroupFocused(group.id)

  // Check if this group is part of a loop (must be before useNodeState)
  const isInLoop = loopHighlight?.groupIds.includes(group.id)

  const nodeState = useNodeState({
    nodeId: group.id,
    nodeType: 'group',
    groupId: group.id,
    isConnecting,
    isFocused,
    isContextMenuOpened,
    hasError: isInLoop,
  })
  const groupCoordinates = useGroupCoordinates(group.id) ?? group.graphCoordinates

  // Analytics for read-only (analytics) mode: use last block of the group as reference
  const lastBlockId = group.blocks.at(-1)?.id ?? ''
  const [isMouseOver, setIsMouseOver] = useState(false)
  const analytics = useAnalyticsActions(lastBlockId, totalVisitedEdges, totalAnswers, isMouseOver)

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.groupId === group.id && isNotDefined(connectingIds.target?.blockId),
    )
  }, [connectingIds, group.id])

  const handleTitleSubmit = (title: string) => updateGroup(groupIndex, { title })

  const handleMouseEnter = () => {
    if (isReadOnly) return
    if (mouseOverGroup?.id !== group.id && groupRef.current)
      setMouseOverGroup({ id: group.id, element: groupRef.current })
    if (connectingIds) setConnectingIds({ ...connectingIds, target: { groupId: group.id } })
  }

  const handleMouseLeave = () => {
    if (isReadOnly) return
    setMouseOverGroup(undefined)
    if (connectingIds) setConnectingIds({ ...connectingIds, target: undefined })
  }

  const startPreviewAtThisGroup = () => {
    setStartPreviewAtGroup(group.id)
    setShowPreviewDrawer(true)
  }

  useDrag(
    ({ first, last, delta, event, target }) => {
      event.stopPropagation()
      if (
        (target as HTMLElement)
          .closest('.prevent-group-drag')
          ?.classList.contains('prevent-group-drag')
      )
        return

      if (first) {
        setIsMouseDown(true)
        if (isFocused && !event.shiftKey) return
        focusGroup(group.id, event.shiftKey)
      }

      moveFocusedGroups({
        x: delta[0] / graphPosition.scale,
        y: delta[1] / graphPosition.scale,
      })

      if (last) {
        const newGroupsCoordinates = getGroupsCoordinates()
        if (!newGroupsCoordinates) return
        if (!isAnalytics) {
          updateGroupsCoordinates(newGroupsCoordinates)
        }
        setIsMouseDown(false)
      }
    },
    {
      target: groupRef,
      pointer: { keys: false },
      from: () => [
        (groupCoordinates?.x ?? 0) * graphPosition.scale,
        (groupCoordinates?.y ?? 0) * graphPosition.scale,
      ],
    },
  )

  return (
    <ContextMenu<HTMLDivElement>
      onOpen={() => {
        focusGroup(group.id)
        setIsContextMenuOpened(true)
      }}
      onClose={() => setIsContextMenuOpened(false)}
      renderMenu={() => <GroupNodeContextMenu groupIndex={groupIndex} groupId={group.id} />}
      isDisabled={isReadOnly}
    >
      {(ref) => {
        return (
          <Stack
            ref={setMultipleRefs([ref, groupRef])}
            id={`group-${group.id}`}
            data-testid="group"
            className="group"
            w={groupWidth}
            transition="border 300ms, box-shadow 200ms"
            pos="absolute"
            style={{
              transform: `translate(${groupCoordinates?.x ?? 0}px, ${groupCoordinates?.y ?? 0}px)`,
              touchAction: 'none',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseOver={() => setIsMouseOver(true)}
            onMouseOut={() => setIsMouseOver(false)}
            cursor={isMouseDown ? 'grabbing' : 'pointer'}
            _hover={{ shadow: 'lg' }}
            zIndex={isFocused ? 10 : 1}
            spacing={isEmpty(group.title) ? '0' : '2'}
            pointerEvents={isDraggingGraph ? 'none' : 'auto'}
            shadow="md"
            p="3"
            bg="bg.normal"
            borderRadius="md"
            outline={getNodeOutline(nodeState)}
          >
            <Editable
              value={groupTitle}
              onChange={setGroupTitle}
              onSubmit={handleTitleSubmit}
              fontWeight="semibold"
              pr="8"
              isDisabled={isReadOnly}
            >
              <EditablePreview
                px="1"
                userSelect={'none'}
                style={
                  isEmpty(groupTitle)
                    ? {
                        display: 'block',
                        position: 'absolute',
                        top: '10px',
                        width: '50px',
                      }
                    : undefined
                }
              />
              <EditableInput minW="0" px="1" className="prevent-group-drag" />
            </Editable>
            {bot && <BlockNodesList blocks={group.blocks} groupIndex={groupIndex} groupRef={ref} />}
            {!isReadOnly && focusedGroups.length === 1 && (
              <GroupActionsBar onPlayClick={startPreviewAtThisGroup} isVisible={isFocused} />
            )}
            {isReadOnly && (
              <AnalyticsFloatingBar
                dropOffRate={analytics.dropOffRate}
                totalDroppedUsers={analytics.totalDroppedUsers}
                totalUsers={analytics.totalUsers}
                tooltipLabel={analytics.tooltipLabel}
              />
            )}
          </Stack>
        )
      }}
    </ContextMenu>
  )
}
