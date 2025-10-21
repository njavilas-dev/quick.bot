import React, { useState } from 'react'
import { Tr } from '@chakra-ui/react'
import { TableData } from '@quickbot.io/schemas'
import { Row as RowProps } from '@tanstack/react-table'
import ResultsTableBodyRowCell from './ResultsTableBodyRowCell'

type Props = {
  row: RowProps<TableData>
  isSelected: boolean
  bottomElement?: React.MutableRefObject<HTMLDivElement | null>
}

export const ResultsTableBodyRow = ({ row, bottomElement, isSelected }: Props) => {
  const [isExpandButtonVisible, setIsExpandButtonVisible] = useState(false)

  const showExpandButton = () => setIsExpandButtonVisible(true)
  const hideExpandButton = () => setIsExpandButtonVisible(false)
  return (
    <Tr
      key={row.id}
      data-rowid={row.id}
      ref={(ref) => {
        if (bottomElement && bottomElement.current?.dataset.rowid !== row.id)
          bottomElement.current = ref
      }}
      onMouseEnter={showExpandButton}
      onClick={showExpandButton}
      onMouseLeave={hideExpandButton}
    >
      {row.getVisibleCells().map((cell) => (
        <ResultsTableBodyRowCell
          key={cell.id}
          cell={cell}
          isExpandButtonVisible={isExpandButtonVisible}
          isSelected={isSelected}
        />
      ))}
    </Tr>
  )
}
