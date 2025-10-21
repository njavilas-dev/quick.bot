import { useEventListener } from '@chakra-ui/react'

interface UseGraphKeyboardEventsParams {
  setIsDraggingGraph: (isDragging: boolean) => void
  setIsDragging: (isDragging: boolean) => void
}

export const useGraphKeyboardEvents = ({
  setIsDraggingGraph,
  setIsDragging,
}: UseGraphKeyboardEventsParams) => {
  // Keyboard controls
  useEventListener(document, 'keydown', (e) => {
    if (e.key === ' ') setIsDraggingGraph(true)
  })

  useEventListener(document, 'keyup', (e) => {
    if (e.key === ' ') {
      setIsDraggingGraph(false)
      setIsDragging(false)
    }
  })

  // Window blur handler
  useEventListener(window, 'blur', () => {
    setIsDraggingGraph(false)
    setIsDragging(false)
  })

  // Right-click prevention
  useEventListener(
    document,
    'mousedown',
    (e) => {
      const isRightClick = e.button === 2
      if (isRightClick) e.stopPropagation()
    },
    {
      capture: true,
    },
  )
}
