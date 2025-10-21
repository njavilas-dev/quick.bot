import { useShallow } from 'zustand/react/shallow'
import { useGroupsStore } from './useGroupsStore'

/**
 * Convenience hook that provides all commonly used group store values and actions.
 * This reduces boilerplate in components that need multiple store values.
 *
 * NOTE: This hook does NOT subscribe to groupsCoordinates to avoid performance issues.
 * Use useGroupCoordinates() for specific group coordinates.
 */
export const useGraphGroups = () => {
  const isDraggingGraph = useGroupsStore((state) => state.isDraggingGraph)
  const setIsDraggingGraph = useGroupsStore((state) => state.setIsDraggingGraph)
  const focusedGroups = useGroupsStore(useShallow((state) => state.focusedGroups))
  const groupsInClipboard = useGroupsStore(useShallow((state) => state.groupsInClipboard))

  const groupActions = useGroupsStore(
    useShallow((state) => ({
      setGroupsCoordinates: state.setGroupsCoordinates,
      blurGroups: state.blurGroups,
      setFocusedGroups: state.setFocusedGroups,
      updateGroupCoordinates: state.updateGroupCoordinates,
      focusGroup: state.focusGroup,
      moveFocusedGroups: state.moveFocusedGroups,
      getGroupsCoordinates: state.getGroupsCoordinates,
      copyGroups: state.copyGroups,
    })),
  )

  return {
    isDraggingGraph,
    setIsDraggingGraph,
    focusedGroups,
    groupsInClipboard,
    ...groupActions,
  }
}

/**
 * Hook to get coordinates for a specific group by ID.
 * Returns the coordinates directly without shallow comparison to ensure
 * real-time updates during drag operations.
 */
export const useGroupCoordinates = (groupId: string | undefined) => {
  return useGroupsStore((state) =>
    groupId && state.groupsCoordinates ? state.groupsCoordinates[groupId] : undefined,
  )
}

/**
 * Hook to check if a specific group is focused.
 * This is more performant than subscribing to the entire focusedGroups array
 * because it only triggers re-render when THIS specific group's focus state changes.
 */
export const useIsGroupFocused = (groupId: string) => {
  return useGroupsStore((state) => state.focusedGroups.includes(groupId))
}
