import React from 'react'
import { IconButton, useDisclosure } from '@chakra-ui/react'
import { DropdownMenu } from '@urbiport/ui'
import { DownloadIcon, MoreHorizontalIcon } from '@urbiport/icons'
import { ResultHeaderCell } from '@quickbot.io/schemas'
import { ResultsTableMenuSettingsColumns } from './ResultsTableMenuSettingsColumns'
import { ResultsTableModalExport } from './ResultsTableModalExport'

type Props = {
  resultHeader: ResultHeaderCell[]
  columnVisibility: { [key: string]: boolean }
  columnOrder: string[]
  onColumnOrderChange: (columnOrder: string[]) => void
  setColumnVisibility: (columnVisibility: { [key: string]: boolean }) => void
}

export const ResultsTableMenuSettings = (props: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <IconButton
        aria-label="Export all"
        onClick={onOpen}
        icon={<DownloadIcon />}
        size="sm"
        variant="outline"
      />
      <DropdownMenu
        placement="bottom-end"
        matchWidth={false}
        closeOnSelect={false}
        menuButtonProps={{
          'aria-label': 'Open table settings',
          as: IconButton,
          icon: <MoreHorizontalIcon />,
          size: 'sm',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ResultsTableMenuSettingsColumns {...props} />
      </DropdownMenu>
      <ResultsTableModalExport onClose={onClose} isOpen={isOpen} />
    </>
  )
}
