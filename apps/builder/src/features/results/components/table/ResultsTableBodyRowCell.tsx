import { memo } from 'react'
import { Box, Td } from '@chakra-ui/react'
import { Cell as CellProps, flexRender } from '@tanstack/react-table'
import { TableData } from '@quickbot.io/schemas'

type Props = {
  cell: CellProps<TableData, unknown>
  isExpandButtonVisible: boolean
  isSelected: boolean
}

const ResultsTableBodyRowCell = ({ cell }: Props) => {
  const isLogsColumn = cell.column.id === 'logs'

  return (
    <Td
      key={cell.id}
      pos="relative"
      position={isLogsColumn ? 'sticky' : undefined}
      right={isLogsColumn ? '0' : undefined}
      backgroundColor={isLogsColumn ? 'white' : undefined}
      style={{
        minWidth: cell.column.getSize(),
        borderStyle: 'solid',
        borderWidth: '0 1px 0 0',
        borderColor: 'var(--chakra-colors-divider-lighter)',
        backgroundColor: isLogsColumn ? 'var(--chakra-colors-bg-normal)' : undefined,
      }}
      className={isLogsColumn ? 'is-sticky' : undefined}
    >
      <Box>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </Box>
    </Td>
  )
}

export default memo(
  ResultsTableBodyRowCell,
  (prev, next) =>
    prev.cell.column.getSize() === next.cell.column.getSize() &&
    prev.isExpandButtonVisible === next.isExpandButtonVisible &&
    prev.isSelected === next.isSelected,
)
