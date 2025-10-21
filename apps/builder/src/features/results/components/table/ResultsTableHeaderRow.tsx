import React from 'react'
import { Tr } from '@chakra-ui/react'
import { HeaderGroup } from '@tanstack/react-table'
import { TableData } from '@quickbot.io/schemas'
import { ResultsTableHeaderRowCell } from './ResultsTableHeaderRowCell'

type Props = {
  headerGroup: HeaderGroup<TableData>
}

export const ResultsTableHeaderRow = ({ headerGroup }: Props) => {
  return (
    <Tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => {
        return <ResultsTableHeaderRowCell key={header.id} header={header} />
      })}
    </Tr>
  )
}
