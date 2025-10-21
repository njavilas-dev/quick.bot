import { useEffect, useMemo, RefObject } from 'react'
import { useDebounce } from 'use-debounce'

interface UseGraphPositionSyncParams {
  graphContainerRef: RefObject<HTMLDivElement>
  graphPosition: {
    x: number
    y: number
    scale: number
  }
  setGlobalGraphPosition: (position: { x: number; y: number; scale: number }) => void
}

export const useGraphTransformSync = ({
  graphContainerRef,
  graphPosition,
  setGlobalGraphPosition,
}: UseGraphPositionSyncParams) => {
  const [debouncedGraphPosition] = useDebounce(graphPosition, 100)

  const transform = useMemo(
    () =>
      `translate(${Number(graphPosition.x.toFixed(2))}px, ${Number(
        graphPosition.y.toFixed(2),
      )}px) scale(${graphPosition.scale})`,
    [graphPosition],
  )

  useEffect(() => {
    if (!graphContainerRef.current) return
    const { top, left } = graphContainerRef.current.getBoundingClientRect()
    setGlobalGraphPosition({
      x: left + debouncedGraphPosition.x,
      y: top + debouncedGraphPosition.y,
      scale: debouncedGraphPosition.scale,
    })
  }, [debouncedGraphPosition, setGlobalGraphPosition, graphContainerRef])

  return { transform }
}
