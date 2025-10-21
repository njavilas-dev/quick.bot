import { BoxProps, Flex, useEventListener } from '@chakra-ui/react'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useEndpoints } from '../../providers/EndpointsProvider'
import { useGraph } from '../../providers/GraphProvider'
import { TEventSource } from '@quickbot.io/schemas'
import { useEndpointPosition } from '../../hooks/useEndpointPosition'

const endpointHeight = 32

export const EventSourceEndpoint = ({
  source,
  isHidden,
  ...props
}: BoxProps & {
  source: TEventSource
  isHidden?: boolean
}) => {
  const { setConnectingIds, previewingEdge, graphPosition } = useGraph()
  const { setSourceEndpointYOffset, deleteSourceEndpointYOffset } = useEndpoints()
  const [eventTransformProp, setEventTransformProp] = useState<string>()
  const ref = useRef<HTMLDivElement | null>(null)

  // Determine endpoint position based on connections
  const endpointPosition = useEndpointPosition(source)

  useLayoutEffect(() => {
    const mutationObserver = new MutationObserver((entries) => {
      setEventTransformProp((entries[0].target as HTMLElement).style.transform)
    })
    const groupElement = document.getElementById(`event-${source.eventId}`)
    if (!groupElement) return
    mutationObserver.observe(groupElement, {
      attributes: true,
      attributeFilter: ['style'],
    })
    return () => {
      mutationObserver.disconnect()
    }
  }, [source.eventId])

  useEffect(() => {
    const y = ref.current
      ? Number(
          (
            (ref.current?.getBoundingClientRect().y +
              (endpointHeight * graphPosition.scale) / 2 -
              graphPosition.y) /
            graphPosition.scale
          ).toFixed(2),
        )
      : undefined
    if (y === undefined) return
    setSourceEndpointYOffset?.({
      id: source.eventId,
      y,
    })
  }, [
    graphPosition.scale,
    graphPosition.y,
    setSourceEndpointYOffset,
    source.eventId,
    eventTransformProp,
  ])

  useEffect(
    () => () => {
      deleteSourceEndpointYOffset?.(source.eventId)
    },
    [deleteSourceEndpointYOffset, source.eventId],
  )

  useEventListener(ref.current, 'pointerdown', (e) => {
    e.stopPropagation()
    setConnectingIds({ source })
  })

  useEventListener(ref.current, 'mousedown', (e) => {
    e.stopPropagation()
  })

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
      {...(endpointPosition === 'left' ? { left: '-19px' } : { right: '-19px' })}
      {...props}
      style={{
        ...(endpointPosition === 'left' ? { left: '-19px' } : { right: '-19px' }),
        ...props.style,
      }}
    >
      <Flex boxSize="20px" justify="center" align="center" bg="bg.normal" borderRadius="full">
        <Flex
          boxSize="13px"
          borderRadius="full"
          borderWidth="3.5px"
          shadow="sm"
          borderColor={
            previewingEdge &&
            'eventId' in previewingEdge.from &&
            previewingEdge.from.eventId === source.eventId
              ? 'brand.dark'
              : 'brand.primary'
          }
        />
      </Flex>
    </Flex>
  )
}
