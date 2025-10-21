import React, { createContext, ReactNode, useContext, useState, useCallback, useEffect } from 'react'
import { HORIZONTAL_MENU_HEIGHT } from '@/features/editor/constants'
import { Coordinates } from '../types'

// Zoom constants
export const maxScale = 2
export const minScale = 0.3
const zoomButtonsScaleBlock = 0.2
const zoomStep = 0.1 // 10% steps for button zoom

export type ZoomMethods = {
  zoomIn: () => void
  zoomOut: () => void
}

export const zoomPinchConfig = {
  scaleBounds: { min: minScale, max: maxScale },
  modifierKey: 'ctrlKey' as const,
}

type ZoomContextType = {
  currentZoom: number
  setCurrentZoom: (zoom: number) => void
  zoomMethods: ZoomMethods | null
  setZoomMethods: (methods: ZoomMethods) => void
  maxZoom: number
  minZoom: number
  zoom: (params: { scale?: number; delta?: number; mousePosition?: Coordinates }) => void
  registerZoom: (params: {
    graphContainerRef: React.RefObject<HTMLDivElement>
    graphPositionRef: React.MutableRefObject<{ x: number; y: number; scale: number }>
    setGraphPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number; scale: number }>>
  }) => void
}

const GraphZoomContext = createContext<ZoomContextType | undefined>(undefined)

export const GraphZoomProvider = ({ children }: { children: ReactNode }) => {
  const [currentZoom, setCurrentZoom] = useState(1)
  const [zoomMethods, setZoomMethodsState] = useState<ZoomMethods | null>(null)
  const zoomParamsRef = React.useRef<{
    graphContainerRef: React.RefObject<HTMLDivElement>
    graphPositionRef: React.MutableRefObject<{ x: number; y: number; scale: number }>
    setGraphPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number; scale: number }>>
  } | null>(null)

  const setZoomMethods = useCallback((methods: ZoomMethods) => {
    setZoomMethodsState(methods)
  }, [])

  const registerZoom = useCallback(
    (params: {
      graphContainerRef: React.RefObject<HTMLDivElement>
      graphPositionRef: React.MutableRefObject<{ x: number; y: number; scale: number }>
      setGraphPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number; scale: number }>>
    }) => {
      zoomParamsRef.current = params
    },
    [],
  )

  const getCenterOfGraph = useCallback((): Coordinates => {
    if (!zoomParamsRef.current?.graphContainerRef.current) return { x: 0, y: 0 }
    const graphWidth = zoomParamsRef.current.graphContainerRef.current.clientWidth ?? 0
    const graphHeight = zoomParamsRef.current.graphContainerRef.current.clientHeight ?? 0
    return {
      x: graphWidth / 2,
      y: graphHeight / 2,
    }
  }, [])

  const zoom = useCallback(
    ({
      scale,
      mousePosition,
      delta,
    }: {
      scale?: number
      delta?: number
      mousePosition?: Coordinates
    }) => {
      if (!zoomParamsRef.current) return

      const { graphPositionRef, setGraphPosition } = zoomParamsRef.current
      const graphPosition = graphPositionRef.current
      const { x: mouseX, y } = mousePosition ?? getCenterOfGraph()
      const mouseY = y - HORIZONTAL_MENU_HEIGHT
      let newScale = graphPosition.scale + (delta ?? 0)
      if (scale) {
        const scaleDiff = scale - graphPosition.scale
        newScale += Math.min(zoomButtonsScaleBlock, Math.abs(scaleDiff)) * Math.sign(scaleDiff)
      }

      // Clamp scale to min/max bounds
      newScale = Math.max(minScale, Math.min(maxScale, newScale))

      // If scale didn't change, don't update (already at limit)
      if (Math.abs(newScale - graphPosition.scale) < 0.0001) {
        return
      }

      const xs = (mouseX - graphPosition.x) / graphPosition.scale
      const ys = (mouseY - graphPosition.y) / graphPosition.scale
      const newPosition = {
        ...graphPosition,
        x: mouseX - xs * newScale,
        y: mouseY - ys * newScale,
        scale: newScale,
      }
      setGraphPosition(newPosition)
      setCurrentZoom(newScale)
    },
    [getCenterOfGraph],
  )

  const zoomToNextStep = useCallback((direction: 'in' | 'out') => {
    if (!zoomParamsRef.current) return

    const currentScale = zoomParamsRef.current.graphPositionRef.current.scale

    // Round to nearest step based on direction
    let targetScale: number
    if (direction === 'in') {
      // Round up to next step
      targetScale = Math.ceil(currentScale / zoomStep) * zoomStep
      // If already at a step, go to next step
      if (Math.abs(targetScale - currentScale) < 0.001) {
        targetScale += zoomStep
      }
    } else {
      // Round down to previous step
      targetScale = Math.floor(currentScale / zoomStep) * zoomStep
      // If already at a step, go to previous step
      if (Math.abs(targetScale - currentScale) < 0.001) {
        targetScale -= zoomStep
      }
    }

    // Clamp to min/max
    targetScale = Math.max(minScale, Math.min(maxScale, targetScale))

    zoom({ scale: targetScale })
  }, [zoom])

  useEffect(() => {
    setZoomMethods({
      zoomIn: () => zoomToNextStep('in'),
      zoomOut: () => zoomToNextStep('out'),
    })
  }, [setZoomMethods, zoomToNextStep])

  return (
    <GraphZoomContext.Provider
      value={{
        currentZoom,
        setCurrentZoom,
        zoomMethods,
        setZoomMethods,
        maxZoom: maxScale,
        minZoom: minScale,
        zoom,
        registerZoom,
      }}
    >
      {children}
    </GraphZoomContext.Provider>
  )
}

export const useGraphZoom = (params?: {
  graphContainerRef?: React.RefObject<HTMLDivElement>
  graphPosition?: { x: number; y: number; scale: number }
  setGraphPosition?: React.Dispatch<React.SetStateAction<{ x: number; y: number; scale: number }>>
}) => {
  const context = useContext(GraphZoomContext)
  if (!context) {
    throw new Error('useGraphZoom must be used within a GraphZoomProvider')
  }

  const { registerZoom, setCurrentZoom } = context
  const graphPositionRef = React.useRef(params?.graphPosition || { x: 0, y: 0, scale: 1 })
  const updateTimeoutRef = React.useRef<NodeJS.Timeout>()
  const lastScale = React.useRef<number>(params?.graphPosition?.scale ?? 1)

  // Always update ref on every render (cheap operation, no re-render)
  if (params?.graphPosition) {
    graphPositionRef.current = params.graphPosition
  }

  // Only update context zoom when scale actually changes
  useEffect(() => {
    const currentScale = params?.graphPosition?.scale ?? 1
    if (currentScale !== lastScale.current) {
      lastScale.current = currentScale

      // Debounce currentZoom updates to avoid re-renders during continuous zoom
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
      updateTimeoutRef.current = setTimeout(() => {
        setCurrentZoom(currentScale)
      }, 100)
    }
  }, [params?.graphPosition?.scale, setCurrentZoom])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  // Register zoom only once
  useEffect(() => {
    if (params?.graphContainerRef && params?.setGraphPosition) {
      registerZoom({
        graphContainerRef: params.graphContainerRef,
        graphPositionRef,
        setGraphPosition: params.setGraphPosition,
      })
    }
  }, [registerZoom, params?.graphContainerRef, params?.setGraphPosition])

  return context
}
