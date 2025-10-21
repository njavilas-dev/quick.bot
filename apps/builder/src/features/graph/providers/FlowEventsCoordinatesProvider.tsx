import { ReactNode, useState, useEffect, useContext, createContext, useCallback } from 'react'
import { Coordinates, CoordinatesMap } from '../types'
import { BotV6 } from '@quickbot.io/schemas'

const flowEventsCoordinatesContext = createContext<{
  eventsCoordinates: CoordinatesMap
  updateEventCoordinates: (groupId: string, newCoord: Coordinates) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const FlowEventsCoordinatesProvider = ({
  children,
  events,
}: {
  children: ReactNode
  events: BotV6['events'][number][]
  isReadOnly?: boolean
}) => {
  const [eventsCoordinates, setEventsCoordinates] = useState<CoordinatesMap>({})

  useEffect(() => {
    setEventsCoordinates(
      events.reduce(
        (coords, group) => ({
          ...coords,
          [group.id]: group.graphCoordinates,
        }),
        {},
      ),
    )
  }, [events])

  const updateEventCoordinates = useCallback(
    (groupId: string, newCoord: Coordinates) =>
      setEventsCoordinates((eventsCoordinates) => ({
        ...eventsCoordinates,
        [groupId]: newCoord,
      })),
    [],
  )

  return (
    <flowEventsCoordinatesContext.Provider value={{ eventsCoordinates, updateEventCoordinates }}>
      {children}
    </flowEventsCoordinatesContext.Provider>
  )
}

export const useFlowEventsCoordinates = () => useContext(flowEventsCoordinatesContext)
