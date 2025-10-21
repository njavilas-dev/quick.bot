import { BoxProps, Flex, useEventListener } from '@chakra-ui/react'
import { BlockSource } from '@quickbot.io/schemas'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useEndpoints } from '../../providers/EndpointsProvider'
import { useGraph } from '../../providers/GraphProvider'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useEndpointPosition } from '../../hooks/useEndpointPosition'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'

const endpointHeight = 32

export const BlockSourceEndpoint = ({
  source,
  groupId,
  isHidden,
  ...props
}: BoxProps & {
  source: BlockSource
  groupId: string
  isHidden?: boolean
}) => {
  const id = source.itemId ?? source.blockId
  const { setConnectingIds, previewingEdge, graphPosition } = useGraph()
  const { setSourceEndpointYOffset, deleteSourceEndpointYOffset } = useEndpoints()
  const { bot } = useBot()
  const ref = useRef<HTMLDivElement | null>(null)
  const [groupHeight, setGroupHeight] = useState<number>()
  const [groupTransformProp, setGroupTransformProp] = useState<string>()

  // Get block
  const block = useMemo(() => {
    if (!bot?.groups) return undefined
    return bot.groups.flatMap((group) => group.blocks).find((block) => block.id === source.blockId)
  }, [bot?.groups, source.blockId])

  // Check if this block/item has any outgoing connections
  const hasOutgoingConnections = useMemo(() => {
    if (!bot?.edges) return false
    return bot.edges.some(
      (edge) =>
        'blockId' in edge.from &&
        edge.from.blockId === source.blockId &&
        edge.from.itemId === source.itemId,
    )
  }, [bot?.edges, source.blockId, source.itemId])

  // Determine endpoint position based on connections
  const endpointPosition = useEndpointPosition(source, groupId)

  const endpointY = useMemo(
    () =>
      ref.current
        ? Number(
          (
            (ref.current?.getBoundingClientRect().y +
              (endpointHeight * graphPosition.scale) / 2 -
              graphPosition.y) /
            graphPosition.scale
          ).toFixed(2),
        )
        : undefined,
    // We need to force recompute whenever the group height and position changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graphPosition.scale, graphPosition.y, groupHeight, groupTransformProp],
  )

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      setGroupHeight(entries[0].contentRect.height)
    })
    const groupElement = document.getElementById(`group-${groupId}`)
    if (!groupElement) return
    resizeObserver.observe(groupElement)
    return () => {
      resizeObserver.disconnect()
    }
  }, [groupId])

  useLayoutEffect(() => {
    const mutationObserver = new MutationObserver((entries) => {
      setGroupTransformProp((entries[0].target as HTMLElement).style.transform)
    })
    const groupElement = document.getElementById(`group-${groupId}`)
    if (!groupElement) return
    mutationObserver.observe(groupElement, {
      attributes: true,
      attributeFilter: ['style'],
    })
    return () => {
      mutationObserver.disconnect()
    }
  }, [groupId])

  useEffect(() => {
    if (!endpointY) return
    setSourceEndpointYOffset?.({
      id,
      y: endpointY,
    })
  }, [setSourceEndpointYOffset, endpointY, id])

  useEffect(
    () => () => {
      deleteSourceEndpointYOffset?.(id)
    },
    [deleteSourceEndpointYOffset, id],
  )

  useEventListener(ref.current, 'pointerdown', (e) => {
    e.stopPropagation()
    if (groupId) setConnectingIds({ source: { ...source, groupId } })
  })

  useEventListener(ref.current, 'mousedown', (e) => {
    e.stopPropagation()
  })

  const getEndpointPositionStyle = (blockType: string) => {
    if (endpointPosition === 'left') {
      if (blockType === InputBlockType.CHOICE) return { left: '-72px' }
      if (blockType === LogicBlockType.AB_TEST) return { left: '-72px' }
      if (blockType === LogicBlockType.CONDITION) return { left: '-72px' }
      return { left: '-34px' }
    } else {
      if (blockType === InputBlockType.CHOICE) return { right: '-46px' }
      if (blockType === LogicBlockType.AB_TEST) return { right: '-183px' }
      if (blockType === LogicBlockType.CONDITION) return { right: '-46px' }
      return { right: '-34px' }
    }
  }

  return (
    <Flex
      ref={ref}
      data-testid="endpoint"
      boxSize="32px"
      borderRadius="full"
      cursor="copy"
      justify="center"
      align="center"
      pointerEvents="all"
      visibility={isHidden ? 'hidden' : 'visible'}
      pos="absolute"
      {...props}
      style={{
        ...getEndpointPositionStyle(block?.type || ''),
        ...props.style,
      }}
    >
      <Flex boxSize="20px" justify="center" align="center" bg="bg.normal" borderRadius="full">
        <Flex
          boxSize="13px"
          borderRadius="full"
          borderWidth="3.5px"
          shadow={`sm`}
          borderColor={
            previewingEdge &&
              'blockId' in previewingEdge.from &&
              previewingEdge.from.blockId === source.blockId &&
              previewingEdge.from.itemId === source.itemId
              ? 'brand.dark'
              : hasOutgoingConnections
                ? 'brand.primary'
                : 'yellow.400'
          }
        />
      </Flex>
    </Flex>
  )
}
