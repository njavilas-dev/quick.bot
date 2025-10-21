import React from 'react'
import { Box, BoxProps, chakra } from '@chakra-ui/react'
import { Header as HeaderProps, flexRender } from '@tanstack/react-table'
import { TableData } from '@quickbot.io/schemas'

type Props = {
  header: HeaderProps<TableData, unknown>
}

export const ResultsTableHeaderRowCell = ({ header }: Props) => {
  const isLogsColumn = header.column.id === 'logs'

  return (
    <chakra.th
      top="0"
      right={isLogsColumn ? '0' : undefined}
      zIndex={1}
      fontWeight="normal"
      whiteSpace="nowrap"
      wordBreak="normal"
      style={{
        minWidth: header.getSize(),
        maxWidth: header.getSize(),
        borderStyle: 'solid',
        borderWidth: '0 1px 0 0',
        borderColor: 'var(--chakra-colors-divider-lighter)',
        backgroundColor: isLogsColumn ? 'var(--chakra-colors-bg-dark)' : undefined,
      }}
      className={isLogsColumn ? 'is-sticky' : undefined}
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
      {header.column.getCanResize() && (
        <ResizeHandle
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
        />
      )}
    </chakra.th>
  )
}

const ResizeHandle = (props: BoxProps) => {
  return (
    <Box
      pos="absolute"
      right="-5px"
      w="10px"
      h="full"
      top="0"
      cursor="col-resize"
      zIndex={2}
      userSelect="none"
      data-testid="resize-handle"
      {...props}
    />
  )
}
