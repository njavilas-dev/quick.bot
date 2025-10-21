import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
  useDisclosure,
} from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import {
  Cell as CellProps,
  ExtractingCell,
  GoogleSheetsBlock,
  GoogleSheetsGetOptions,
  GoogleSheetsGetOptionsV6,
  GoogleSheetsInsertRowOptions,
  GoogleSheetsUpdateRowOptionsV6,
} from '@quickbot.io/schemas'
import React, { useEffect, useMemo, useState } from 'react'
import { isDefined } from '@quickbot.io/lib'
import { SheetsDropdown } from './SheetsDropdown'
import { CellWithValueStack } from './CellWithValueStack'
import { CellWithVariableIdStack } from './CellWithVariableIdStack'
import { GoogleSheetConnectModal } from './GoogleSheetsConnectModal'
import { TableList } from '@/components/TableList'
import { ForgedCredentialsDropdown } from '@/features/forge/components/credentials/ForgedCredentialsDropdown'
import { RowsFilterTableList } from './RowsFilterTableList'
import { useWorkspace } from '@/hooks/useWorkspace'
import { Sheet } from '../types'
import {
  GoogleSheetsAction,
  defaultGoogleSheetsOptions,
  totalRowsToExtractOptions,
} from '@quickbot.io/schemas/features/blocks/integrations/googleSheets/constants'
import { GoogleSpreadsheetPicker } from './GoogleSpreadsheetPicker'
import { FormControl, Select } from '@urbiport/ui'
import { trpc } from '@/lib/trpc'

type Props = {
  options: GoogleSheetsBlock['options']
  onOptionsChange: (options: GoogleSheetsBlock['options']) => void
  blockId: string
}

type GoogleSheets = {
  id: string
  name: string
  columns: string[]
}

export const GoogleSheetsSettings = ({ options, onOptionsChange, blockId }: Props) => {
  const { workspace } = useWorkspace()
  const { bot } = useBot()
  const { save } = useBot()
  const [sheets, setSheets] = useState<GoogleSheets[]>([])

  const { data, isSuccess, isLoading } = trpc.googleSheets.getSpreadsheets.useQuery(
    {
      spreadsheetId: options?.spreadsheetId,
      credentialsId: options?.credentialsId,
    },
    {
      enabled: !!options?.spreadsheetId && !!options?.credentialsId,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  useEffect(() => {
    if (isSuccess && data) {
      setSheets(data.sheets)
    }
  }, [isSuccess, data])

  const { isOpen, onOpen, onClose } = useDisclosure()
  const sheet = useMemo(
    () => sheets?.find((s) => s.id === options?.sheetId),
    [sheets, options?.sheetId],
  )
  const handleCredentialsIdChange = (credentialsId: string | undefined) =>
    onOptionsChange({
      ...options,
      credentialsId,
    })
  const handleSpreadsheetIdChange = (spreadsheetId: string | undefined) =>
    onOptionsChange({ ...options, spreadsheetId })
  const handleSheetIdChange = (sheetId: string | undefined) =>
    onOptionsChange({ ...options, sheetId })

  const handleActionChange = (action: GoogleSheetsAction) =>
    onOptionsChange({
      credentialsId: options?.credentialsId,
      spreadsheetId: options?.spreadsheetId,
      sheetId: options?.sheetId,
      action,
    })

  const handleCreateNewClick = async () => {
    await save()
    onOpen()
  }

  return (
    <Stack spacing={6}>
      {workspace && (
        <ForgedCredentialsDropdown
          type="google sheets"
          workspaceId={workspace.id}
          currentCredentialsId={options?.credentialsId}
          onCredentialsSelect={handleCredentialsIdChange}
          onCredentialsCreate={handleCreateNewClick}
          credentialsName="Sheets account"
        />
      )}
      {bot && (
        <GoogleSheetConnectModal
          botId={bot.id}
          blockId={blockId}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
      {options?.credentialsId && workspace && (
        <GoogleSpreadsheetPicker
          spreadsheetId={options.spreadsheetId}
          workspaceId={workspace.id}
          credentialsId={options.credentialsId}
          onSpreadsheetIdSelect={handleSpreadsheetIdChange}
        />
      )}
      {options?.spreadsheetId && options.credentialsId && (
        <SheetsDropdown
          sheets={sheets ?? []}
          isLoading={isLoading}
          sheetId={options.sheetId}
          onSelectSheetId={handleSheetIdChange}
          errors={data?.errors}
          spreadsheetId={options.spreadsheetId}
        />
      )}
      {options?.spreadsheetId && options.credentialsId && isDefined(options.sheetId) && (
        <FormControl>
          <Select<GoogleSheetsAction>
            withClear={false}
            selectedItem={'action' in options ? options.action : undefined}
            onSelect={handleActionChange}
            items={Object.values(GoogleSheetsAction)}
            placeholder="Select an operation"
          />
        </FormControl>
      )}
      {options?.spreadsheetId && options.credentialsId && isDefined(options.sheetId) && options?.action && (
        <ActionOptions options={options} sheet={sheet} onOptionsChange={onOptionsChange} />
      )}
    </Stack>
  )
}

const ActionOptions = ({
  options,
  sheet,
  onOptionsChange,
}: {
  options: GoogleSheetsGetOptionsV6 | GoogleSheetsInsertRowOptions | GoogleSheetsUpdateRowOptionsV6
  sheet?: Sheet
  onOptionsChange: (options: GoogleSheetsBlock['options']) => void
}) => {
  const handleInsertColumnsChange = (cellsToInsert: CellProps[]) =>
    onOptionsChange({
      ...options,
      cellsToInsert,
    } as GoogleSheetsBlock['options'])

  const handleUpsertColumnsChange = (cellsToUpsert: CellProps[]) =>
    onOptionsChange({
      ...options,
      cellsToUpsert,
    } as GoogleSheetsBlock['options'])

  const handleExtractingCellsChange = (cellsToExtract: ExtractingCell[]) =>
    onOptionsChange({
      ...options,
      cellsToExtract,
    } as GoogleSheetsBlock['options'])

  const handleFilterChange = (filter: GoogleSheetsGetOptions['filter']) =>
    onOptionsChange({ ...options, filter } as GoogleSheetsBlock['options'])

  const updateTotalRowsToExtract = (
    totalRowsToExtract: (typeof totalRowsToExtractOptions)[number],
  ) =>
    onOptionsChange({
      ...options,
      totalRowsToExtract,
    } as GoogleSheetsBlock['options'])

  switch (options.action) {
    case GoogleSheetsAction.INSERT_ROW:
      return (
        <TableList<CellProps>
          initialItems={options.cellsToInsert}
          onItemsChange={handleInsertColumnsChange}
          addLabel="Add a value"
        >
          {({ item, onItemChange }) => (
            <CellWithValueStack
              item={item}
              onItemChange={onItemChange}
              columns={sheet?.columns ?? []}
            />
          )}
        </TableList>
      )
    case GoogleSheetsAction.UPDATE_ROW:
      return (
        <Accordion allowMultiple>
          <AccordionItem>
            <AccordionButton>
              Row(s) to update
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <RowsFilterTableList
                columns={sheet?.columns ?? []}
                filter={options.filter}
                onFilterChange={handleFilterChange}
              />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              Cells to update
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel>
              <TableList<CellProps>
                initialItems={options.cellsToUpsert}
                onItemsChange={handleUpsertColumnsChange}
                addLabel="Add a value"
              >
                {({ item, onItemChange }) => (
                  <CellWithValueStack
                    item={item}
                    onItemChange={onItemChange}
                    columns={sheet?.columns ?? []}
                  />
                )}
              </TableList>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )
    case GoogleSheetsAction.GET:
      return (
        <Accordion allowMultiple>
          <AccordionItem>
            <AccordionButton>
              Select row(s)
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <FormControl mb={4}>
                <Select
                  items={totalRowsToExtractOptions}
                  selectedItem={
                    options.totalRowsToExtract ?? defaultGoogleSheetsOptions.totalRowsToExtract
                  }
                  onSelect={updateTotalRowsToExtract}
                  withClear={false}
                />
              </FormControl>
              <RowsFilterTableList
                columns={sheet?.columns ?? []}
                filter={options.filter}
                onFilterChange={handleFilterChange}
              />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              Columns to extract
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <TableList<ExtractingCell>
                initialItems={options.cellsToExtract}
                onItemsChange={handleExtractingCellsChange}
                addLabel="Add a value"
                hasDefaultItem
              >
                {({ item, onItemChange }) => (
                  <CellWithVariableIdStack
                    item={item}
                    onItemChange={onItemChange}
                    columns={sheet?.columns ?? []}
                  />
                )}
              </TableList>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )
    default:
      return <></>
  }
}
