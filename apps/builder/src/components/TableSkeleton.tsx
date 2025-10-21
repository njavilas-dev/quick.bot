import React from 'react'

import { Checkbox, Skeleton, Td, Tr } from '@chakra-ui/react'

type TableSkeletonProps = {
  rows?: number
  columns: number
}

export const TableSkeleton = ({ rows = 3, columns }: TableSkeletonProps) => {
  return (
    <>
      {Array.from(Array(rows)).map((_, index) => (
        <Tr key={index}>
          <Td>
            <Checkbox isDisabled />
          </Td>
          {Array.from(Array(columns - 1)).map((_, index) => {
            return (
              <Td key={index}>
                <Skeleton maxW="66.66%" h="5px" />
              </Td>
            )
          })}
        </Tr>
      ))}
    </>
  )
}
