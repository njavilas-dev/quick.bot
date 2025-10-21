import { useState } from 'react'
import { Text, Portal, Flex, HStack, IconButton, MenuItem } from '@chakra-ui/react'
import { EyeOffIcon, MenuIcon, EyeOnIcon } from '@urbiport/icons'
import { ResultHeaderCell } from '@quickbot.io/schemas'
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ResultsTableColumnIcon } from './ResultsTableColumnIcon'

type Props = {
  resultHeader: ResultHeaderCell[]
  columnVisibility: { [key: string]: boolean }
  columnOrder: string[]
  onColumnOrderChange: (columnOrder: string[]) => void
  setColumnVisibility: (columnVisibility: { [key: string]: boolean }) => void
}

const SortableColumn = ({
  header,
  onEyeClick,
  isHidden,
}: {
  header: ResultHeaderCell
  onEyeClick: (key: string) => () => void
  isHidden: boolean
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <MenuItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      opacity={isDragging || isHidden ? 0.5 : 1}
    >
      <HStack justify="space-between" w="full">
        <HStack overflow="hidden">
          <IconButton
            variant="ghost"
            size="xs"
            cursor="grab"
            icon={<MenuIcon />}
            aria-label="Drag"
            {...listeners}
          />
          <ResultsTableColumnIcon header={header} />
          <Text noOfLines={1}>{header.label}</Text>
        </HStack>
        <IconButton
          size="xs"
          variant="outline"
          aria-label="Hide column"
          icon={isHidden ? <EyeOffIcon /> : <EyeOnIcon />}
          onClick={onEyeClick(header.id)}
        />
      </HStack>
    </MenuItem>
  )
}

export const ResultsTableMenuSettingsColumns = ({
  resultHeader,
  columnVisibility,
  setColumnVisibility,
  columnOrder,
  onColumnOrderChange,
}: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null)

  const onEyeClick = (id: string) => () => {
    if (columnVisibility[id] === false) {
      setColumnVisibility({ ...columnVisibility, [id]: true })
    } else {
      setColumnVisibility({ ...columnVisibility, [id]: false })
    }
  }
  const sortedHeader = resultHeader.sort(
    (a, b) => columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id),
  )
  const hiddenHeaders = resultHeader.filter((header) => columnVisibility[header.id] === false)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setDraggingColumnId(active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(active.id as string)
      const newIndex = columnOrder.indexOf(over?.id as string)
      if (newIndex === -1 || oldIndex === -1) return
      const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex)
      onColumnOrderChange(newColumnOrder)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
        {sortedHeader.map((header) => {
          const isHidden = hiddenHeaders.some((hiddenHeader) => hiddenHeader.id === header.id)
          return (
            <SortableColumn
              key={header.id}
              header={header}
              onEyeClick={onEyeClick}
              isHidden={isHidden}
            />
          )
        })}
      </SortableContext>
      <Portal>
        <DragOverlay dropAnimation={{ duration: 0 }}>
          {draggingColumnId ? <Flex /> : null}
        </DragOverlay>
      </Portal>
    </DndContext>
  )
}
