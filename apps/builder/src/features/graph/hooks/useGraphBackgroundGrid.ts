import { useLayoutEffect } from 'react'

const GRID_SIZE = 30

export const useGraphBackgroundGrid = (
  graphContainerRef: React.RefObject<HTMLDivElement>,
  graphPosition: { x: number; y: number; scale: number },
) => {
  // Use useLayoutEffect instead of useEffect to update background synchronously
  // before the browser paints. This prevents visual lag between graph content
  // and background dots during zoom/pan operations.
  useLayoutEffect(() => {
    const el = graphContainerRef.current
    if (!el) return

    document.documentElement.style.setProperty('--scale', graphPosition.scale.toString())
    el.style.setProperty('background-position-x', `${graphPosition.x}px`)
    el.style.setProperty('background-position-y', `${graphPosition.y}px`)
    el.style.setProperty(
      'background-size',
      `${GRID_SIZE * graphPosition.scale}px ${GRID_SIZE * graphPosition.scale}px`,
    )
  }, [graphContainerRef, graphPosition.x, graphPosition.y, graphPosition.scale])
}
