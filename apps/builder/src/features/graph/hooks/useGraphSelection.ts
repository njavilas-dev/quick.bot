import { Vector2 } from '@use-gesture/react'
import { useCallback, useState, useRef } from 'react'
import { Coordinates } from '../types'
import { computeSelectBoxDimensions } from '../helpers/computeSelectBoxDimensions'
import { isSelectBoxIntersectingWithElement } from '../helpers/isSelectBoxIntersectingWithElement'

type UseGraphSelectionParams = {
  enabled: boolean
  onSelectionChange: (groupIds: string[]) => void
}

export type SelectBoxCoordinates = {
  origin: Coordinates
  dimension: {
    width: number
    height: number
  }
}

const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((val, idx) => val === sortedB[idx])
}

export const useGraphSelection = ({ enabled, onSelectionChange }: UseGraphSelectionParams) => {
  const [selectBoxCoordinates, setSelectBoxCoordinates] = useState<SelectBoxCoordinates | undefined>()
  const [groupRects, setGroupRects] = useState<{ groupId: string; rect: DOMRect }[] | undefined>()
  const lastSelectedGroupsRef = useRef<string[]>([])
  const rafRef = useRef<number>()

  const startSelection = useCallback(() => {
    if (!enabled) return

    const currentGroupRects = Array.from(document.querySelectorAll('.group')).map((element) => {
      return {
        groupId: element.id.split('-')[1],
        rect: element.getBoundingClientRect(),
      }
    })
    setGroupRects(currentGroupRects)
    lastSelectedGroupsRef.current = []
  }, [enabled])

  const updateSelection = useCallback(
    (props: { initial: Vector2; movement: Vector2 }) => {
      if (!enabled || !groupRects) return

      const dimensions = computeSelectBoxDimensions(props)

      // Update visual box immediately
      setSelectBoxCoordinates(dimensions)

      // Throttle the selection calculation using RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        const selectedGroups = groupRects.reduce<string[]>((groups, element) => {
          if (isSelectBoxIntersectingWithElement(dimensions, element.rect)) {
            return [...groups, element.groupId]
          }
          return groups
        }, [])

        // Only update if selection changed
        if (!arraysEqual(selectedGroups, lastSelectedGroupsRef.current)) {
          lastSelectedGroupsRef.current = selectedGroups
          if (selectedGroups.length > 0) {
            onSelectionChange(selectedGroups)
          }
        }
      })
    },
    [enabled, groupRects, onSelectionChange],
  )

  const clearSelection = useCallback(() => {
    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    setSelectBoxCoordinates(undefined)
    setGroupRects(undefined)
    lastSelectedGroupsRef.current = []
  }, [])

  return {
    selectBoxCoordinates,
    startSelection,
    updateSelection,
    clearSelection,
  }
}
