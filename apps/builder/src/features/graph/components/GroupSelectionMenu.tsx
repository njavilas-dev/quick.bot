import { CopyIcon, TrashIcon } from '@urbiport/icons'
import { HORIZONTAL_MENU_HEIGHT } from '@/features/editor/constants'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { ButtonGroup, Button, IconButton, useEventListener } from '@chakra-ui/react'
import { useToast } from '@urbiport/ui'
import { useRef, useState } from 'react'
import { useGraphGroups } from '../hooks/useGraphGroups'
import { createId } from '@quickbot.io/lib/createId'
import { Edge, GroupV6, Variable } from '@quickbot.io/schemas'
import { Coordinates } from '../types'
import { projectMouse } from '../helpers/projectMouse'
import {
  extractVariableIdReferencesInObject,
  extractVariableIdsFromObject,
} from '@quickbot.io/variables/extractVariablesFromObject'

type Props = {
  graphPosition: Coordinates & { scale: number }
  isReadOnly: boolean
  focusedGroups: string[]
  blurGroups: () => void
}

export const GroupSelectionMenu = ({
  graphPosition,
  isReadOnly,
  focusedGroups,
  blurGroups,
}: Props) => {
  const { showToast } = useToast()
  const [mousePosition, setMousePosition] = useState<Coordinates>()
  const { bot, deleteGroups, pasteGroups } = useBot()
  const ref = useRef<HTMLDivElement>(null)

  const { groupsInClipboard, copyGroups, setFocusedGroups, updateGroupCoordinates } =
    useGraphGroups()

  useEventListener(ref.current, 'pointerdown', (e) => e.stopPropagation())
  useEventListener(ref.current, 'pointermove', (e) => e.stopPropagation())
  useEventListener(ref.current, 'pointerup', (e) => e.stopPropagation())

  useEventListener(document, 'mousemove', (e) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    })
  })

  const handleCopy = () => {
    if (!bot) return

    // Validación: no copiar si no hay grupos seleccionados
    if (!focusedGroups || focusedGroups.length === 0) {
      showToast({
        title: 'No groups selected',
        description: 'Please select groups before copying',
        status: 'info',
      })
      return
    }

    const groups = bot.groups.filter((g) => focusedGroups.includes(g.id))

    // Validación adicional: verificar que los grupos filtrados no estén vacíos
    if (groups.length === 0) {
      showToast({
        title: 'Error copying groups',
        description: 'Selected groups not found in bot',
        status: 'error',
      })
      return
    }

    const edges = bot.edges.filter((edge) => groups.find((g) => g.id === edge.to.groupId))
    const variables = extractVariablesFromCopiedGroups(groups, bot.variables)

    copyGroups({
      groups,
      edges,
      variables,
    })
    return {
      groups,
      edges,
      variables,
    }
  }

  const handleDelete = () => {
    deleteGroups(focusedGroups)
    blurGroups()
  }

  const handlePaste = (overrideClipBoard?: {
    groups: GroupV6[]
    edges: Edge[]
    variables: Omit<Variable, 'value'>[]
  }) => {
    if (!groupsInClipboard || isReadOnly || !mousePosition) return

    const clipboard = overrideClipBoard ?? groupsInClipboard
    const { groups, oldToNewIdsMapping } = parseGroupsToPaste(
      clipboard.groups,
      projectMouse(mousePosition, graphPosition),
    )

    groups.forEach((group) => {
      updateGroupCoordinates(group.id, group.graphCoordinates)
    })
    pasteGroups(groups, clipboard.edges, clipboard.variables, oldToNewIdsMapping)
    setFocusedGroups(groups.map((g) => g.id))
  }

  useKeyboardShortcuts({
    copy: () => {
      handleCopy()
      showToast({
        title: 'Copied',
        description: 'Groups copied to clipboard',
        status: 'success',
      })
    },
    cut: () => {
      handleCopy()
      handleDelete()
    },
    duplicate: () => {
      const clipboard = handleCopy()
      handlePaste(clipboard)
    },
    backspace: handleDelete,
    paste: handlePaste,
  })

  return (
    <ButtonGroup
      ref={ref}
      isAttached={true}
      variant="outline"
      size="sm"
      bg="bg.dark"
      borderRadius="md"
      borderWidth="1px"
      shadow="md"
      pos="fixed"
      top={`calc(${HORIZONTAL_MENU_HEIGHT}px + 20px)`}
      zIndex={1}
      right="100px"
    >
      <Button
        pointerEvents={'none'}
        color="text"
        borderRightRadius="none"
        variant="ghost"
        borderRightWidth="1px"
      >
        {focusedGroups.length} selected
      </Button>
      <IconButton
        aria-label="Copy"
        icon={<CopyIcon />}
        variant="ghost"
        onClick={() => {
          handleCopy()
          showToast({
            title: 'Copied',
            description: 'Groups copied to clipboard',
            status: 'success',
          })
        }}
        borderRightWidth="1px"
        borderLeftRadius="none"
        borderRightRadius="none"
      />

      <IconButton
        aria-label="Delete"
        icon={<TrashIcon />}
        variant="ghost"
        onClick={handleDelete}
        borderLeftRadius="none"
      />
    </ButtonGroup>
  )
}

const parseGroupsToPaste = (
  groups: GroupV6[],
  mousePosition: Coordinates,
): { groups: GroupV6[]; oldToNewIdsMapping: Map<string, string> } => {
  // Validación: verificar que el array de grupos no esté vacío
  if (!groups || groups.length === 0) {
    return {
      groups: [],
      oldToNewIdsMapping: new Map(),
    }
  }

  const sortedGroups = groups.sort((a, b) => {
    const aX = a?.graphCoordinates?.x ?? 0
    const bX = b?.graphCoordinates?.x ?? 0
    return aX - bX
  })

  const farLeftGroup = sortedGroups[0]

  if (!farLeftGroup || !farLeftGroup.graphCoordinates) {
    return {
      groups: [],
      oldToNewIdsMapping: new Map(),
    }
  }

  const farLeftGroupCoord = farLeftGroup.graphCoordinates

  const oldToNewIdsMapping = new Map<string, string>()
  const newGroups = groups.map((group) => {
    const newId = createId()
    oldToNewIdsMapping.set(group.id, newId)

    return {
      ...group,
      id: newId,
      graphCoordinates:
        group.id === farLeftGroup.id
          ? mousePosition
          : {
              x: mousePosition.x + group.graphCoordinates.x - farLeftGroupCoord.x,
              y: mousePosition.y + group.graphCoordinates.y - farLeftGroupCoord.y,
            },
    }
  })

  return {
    groups: newGroups,
    oldToNewIdsMapping,
  }
}

const extractVariablesFromCopiedGroups = (
  groups: GroupV6[],
  existingVariables: Variable[],
): Omit<Variable, 'value'>[] => {
  const groupsStr = JSON.stringify(groups)
  if (!groupsStr) return []
  const calledVariablesId = extractVariableIdReferencesInObject(groups, existingVariables)
  const variableIdsInOptions = extractVariableIdsFromObject(groups)

  return [...variableIdsInOptions, ...calledVariablesId].reduce<Omit<Variable, 'value'>[]>(
    (acc, id) => {
      if (!id) return acc
      if (acc.find((v) => v.id === id)) return acc
      const variable = existingVariables.find((v) => v.id === id)
      if (!variable) return acc
      return [
        ...acc,
        {
          id: variable.id,
          name: variable.name,
          isSavedVariable: variable.isSavedVariable,
        },
      ]
    },
    [],
  )
}
