import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Button, HStack, IconButton, Stack, Table, Tbody, Text, Thead } from '@chakra-ui/react'
import { AlignLeftTextIcon } from '@urbiport/icons'
import {
  CellValueType,
  ResultHeaderCell,
  ResultsTablePreferences,
  TableData,
} from '@quickbot.io/schemas'
import { useReactTable, getCoreRowModel, ColumnDef, Updater } from '@tanstack/react-table'
import { parseColumnsOrder } from '@quickbot.io/results/parseColumnsOrder'
import { useBot } from '@/features/editor/providers/BotProvider'
import { ResultsTableMenuSettings } from './ResultsTableMenuSettings'
import { ResultsTableHeaderRow } from './ResultsTableHeaderRow'
import { ResultsTableHeaderRowCheckbox } from './ResultsTableHeaderRowCheckbox'
import { ResultsTableColumnIcon } from './ResultsTableColumnIcon'
import { ResultsTableMenuSelection } from './ResultsTableMenuSelection'
import { ResultsTableBodyRow } from './ResultsTableBodyRow'
import { ExpandIcon, PlusIcon } from '@urbiport/icons'
import { TableSkeleton } from '@/components/TableSkeleton'

type ResultsTableProps = {
  resultHeader: ResultHeaderCell[]
  data: TableData[]
  hasMore?: boolean
  preferences?: ResultsTablePreferences
  onScrollToBottom: () => void
  onLogOpenIndex: (index: number) => () => void
  onResultExpandIndex: (index: number) => () => void
}

export const ResultsTable = ({
  resultHeader,
  data,
  hasMore,
  preferences,
  onScrollToBottom,
  onLogOpenIndex,
  onResultExpandIndex,
}: ResultsTableProps) => {
  const { updateBot, currentUserMode } = useBot()
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isTableScrolled, setIsTableScrolled] = useState(false)
  const bottomElement = useRef<HTMLDivElement | null>(null)
  const tableWrapper = useRef<HTMLDivElement | null>(null)

  const {
    columnsOrder,
    columnsVisibility = {},
    columnsWidth = {},
  } = {
    ...preferences,
    columnsOrder: parseColumnsOrder(preferences?.columnsOrder, resultHeader),
  }

  const changeColumnOrder = (newColumnOrder: string[]) => {
    if (typeof newColumnOrder === 'function') return
    updateBot({
      updates: {
        resultsTablePreferences: {
          columnsOrder: newColumnOrder,
          columnsVisibility,
          columnsWidth,
        },
      },
    })
  }

  const changeColumnVisibility = (newColumnVisibility: Record<string, boolean>) => {
    if (typeof newColumnVisibility === 'function') return
    updateBot({
      updates: {
        resultsTablePreferences: {
          columnsVisibility: newColumnVisibility,
          columnsWidth,
          columnsOrder,
        },
      },
    })
  }

  const changeColumnSizing = (newColumnSizing: Updater<Record<string, number>>) => {
    if (typeof newColumnSizing === 'object') return
    updateBot({
      updates: {
        resultsTablePreferences: {
          columnsWidth: newColumnSizing(columnsWidth),
          columnsVisibility,
          columnsOrder,
        },
      },
    })
  }

  const columns = React.useMemo<ColumnDef<TableData>[]>(
    () => [
      {
        id: 'select',
        enableResizing: false,
        maxSize: 40,
        header: ({ table }) => (
          <ResultsTableHeaderRowCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <ResultsTableHeaderRowCheckbox
              {...{
                checked: row.getIsSelected(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      },
      ...resultHeader.map<ColumnDef<TableData>>((header) => ({
        id: header.id,
        accessorKey: header.id,
        size: 200,
        header: () => (
          <HStack overflow="hidden" data-testid={`${header.label} header`}>
            <ResultsTableColumnIcon header={header} />
            <Text>{header.label}</Text>
          </HStack>
        ),
        cell: (info) => {
          const value = info?.getValue() as CellValueType | undefined
          if (!value) return
          return value.element || value.plainText || ''
        },
      })),
      {
        id: 'logs',
        enableResizing: false,
        maxSize: 110,
        header: () => (
          <Button
            variant="unstyled"
            leftIcon={<ExpandIcon />}
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
          >
            More
          </Button>
        ),
        cell: ({ row }) => (
          <HStack spacing={2}>
            <IconButton
              aria-label="Expand logs"
              variant="outline"
              icon={<AlignLeftTextIcon />}
              size="xs"
              onClick={onLogOpenIndex(row.index)}
            />
            <IconButton
              aria-label="Expand results"
              variant="outline"
              icon={<PlusIcon />}
              size="xs"
              onClick={onResultExpandIndex(row.index)}
            />
          </HStack>
        ),
      },
    ],
    [onLogOpenIndex, onResultExpandIndex, resultHeader],
  )

  const instance = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnVisibility: columnsVisibility,
      columnOrder: columnsOrder,
      columnSizing: columnsWidth,
    },
    getRowId: (row) => row.id.plainText,
    columnResizeMode: 'onChange',
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: changeColumnSizing,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleObserver = useCallback(
    (entities: IntersectionObserverEntry[]) => {
      const target = entities[0]
      if (target.isIntersecting && hasMore) onScrollToBottom()
    },
    [onScrollToBottom, hasMore],
  )

  useEffect(() => {
    if (!bottomElement.current) return
    const options: IntersectionObserverInit = {
      root: tableWrapper.current,
      threshold: 0,
      rootMargin: "300px"
    }
    const observer = new IntersectionObserver(handleObserver, options)
    if (bottomElement.current) observer.observe(bottomElement.current)

    return () => {
      observer.disconnect()
    }
  }, [handleObserver])

  return (
    <Stack w="full">
      <HStack w="full" justifyContent="flex-end">
        {currentUserMode === 'write' && (
          <ResultsTableMenuSelection
            selectedResultsId={Object.keys(rowSelection)}
            onClearSelection={() => setRowSelection({})}
          />
        )}
        <ResultsTableMenuSettings
          resultHeader={resultHeader}
          columnVisibility={columnsVisibility}
          setColumnVisibility={changeColumnVisibility}
          columnOrder={columnsOrder}
          onColumnOrderChange={changeColumnOrder}
        />
      </HStack>
      <Box
        ref={tableWrapper}
        w="100%"
        overflow="auto"
        border="1px solid"
        borderColor="divider.light"
        borderRadius="md"
        data-testid="results-table"
        onScroll={(e) =>
          setIsTableScrolled(
            (e.target as HTMLElement).scrollTop > 0 || (e.target as HTMLElement).scrollLeft > 0,
          )
        }
      >
        <Table
          variant="table"
          borderRadius="md"
          bg="bg.normal"
          w="full"
          className={isTableScrolled ? 'is-scrolled' : ''}
          sx={{
            '& .is-sticky': {
              position: 'sticky',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: '-5px',
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'linear-gradient(to left, rgba(0, 0, 0, 0.1), transparent)',
                pointerEvents: 'none',
                zIndex: 9,
              },
            },
            '&.is-scrolled .is-sticky::after': {
              content: '""',
              position: 'absolute',
              left: '-5px',
              top: 0,
              bottom: 0,
              width: '5px',
              background: 'linear-gradient(to left, rgba(0, 0, 0, 0.1), transparent)',
              pointerEvents: 'none',
              zIndex: 9,
            },
            '& td': {
              position: 'relative',
              maxHeight: '200px',
              verticalAlign: 'top',
              '& > div': {
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'block',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              },
            },
            '& tr': {
              borderBottom: '1px solid',
              borderColor: 'divider.subtle',
            },
          }}
        >
          <Thead>
            {instance.getHeaderGroups().map((headerGroup) => (
              <ResultsTableHeaderRow key={headerGroup.id} headerGroup={headerGroup} />
            ))}
          </Thead>
          <Tbody>
            {instance.getRowModel().rows.map((row, rowIndex) => (
              <ResultsTableBodyRow
                row={row}
                key={row.id}
                bottomElement={rowIndex === data.length - 5 ? bottomElement : undefined}
                isSelected={row.getIsSelected()}
              />
            ))}
            {hasMore === true && (
              <TableSkeleton
                columns={
                  resultHeader.filter((header) => columnsVisibility[header.id] !== false).length + 2
                }
              />
            )}
          </Tbody>
        </Table>
      </Box>
    </Stack>
  )
}
