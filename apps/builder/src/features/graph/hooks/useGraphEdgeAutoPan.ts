import { useEffect, useState } from 'react'
import { ConnectingIds } from '../types'
import { HORIZONTAL_MENU_HEIGHT } from '@/features/editor/constants'

export const useGraphEdgeAutoPan = (
  connectingIds: ConnectingIds | null,
  setGraphPosition: React.Dispatch<
    React.SetStateAction<{
      x: number
      y: number
      scale: number
    }>
  >,
) => {
  const [autoMoveDirection, setAutoMoveDirection] = useState<
    'top' | 'right' | 'bottom' | 'left' | undefined
  >()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!connectingIds) return autoMoveDirection ? setAutoMoveDirection(undefined) : undefined
      if (e.clientX <= 50) return setAutoMoveDirection('left')
      if (e.clientY <= 50 + HORIZONTAL_MENU_HEIGHT) return setAutoMoveDirection('top')
      if (e.clientX >= window.innerWidth - 50) return setAutoMoveDirection('right')
      if (e.clientY >= window.innerHeight - 50) return setAutoMoveDirection('bottom')
      setAutoMoveDirection(undefined)
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [connectingIds, autoMoveDirection])

  useEffect(() => {
    if (!autoMoveDirection) return
    const interval = setInterval(() => {
      setGraphPosition((prev) => ({
        ...prev,
        x:
          autoMoveDirection === 'right'
            ? prev.x - 5
            : autoMoveDirection === 'left'
              ? prev.x + 5
              : prev.x,
        y:
          autoMoveDirection === 'bottom'
            ? prev.y - 5
            : autoMoveDirection === 'top'
              ? prev.y + 5
              : prev.y,
      }))
    }, 5)

    return () => {
      clearInterval(interval)
    }
  }, [autoMoveDirection, setGraphPosition])
}
