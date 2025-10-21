import React, { useState } from 'react'
import { unparse } from 'papaparse'
import { trpc } from '@/lib/trpc'
import { useTranslate } from '@tolgee/react'
import { Button, Text, useDisclosure, IconButton, ButtonGroup } from '@chakra-ui/react'
import { useToast } from '@urbiport/ui'
import { byId } from '@quickbot.io/lib'
import { DownloadIcon, TrashIcon } from '@urbiport/icons'
import { parseColumnsOrder } from '@quickbot.io/results/parseColumnsOrder'
import { parseUniqueKey } from '@quickbot.io/lib/parseUniqueKey'
import { ConfirmModal } from '@/components/ConfirmModal'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useResults } from '../../ResultsProvider'

type Props = {
  selectedResultsId: string[]
  onClearSelection: () => void
}

export const ResultsTableMenuSelection = ({ selectedResultsId, onClearSelection }: Props) => {
  const { t } = useTranslate()
  const { bot } = useBot()
  const { showToast } = useToast()
  const { resultHeader, tableData, onDeleteResults } = useResults()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isExportLoading, setIsExportLoading] = useState(false)
  const trpcContext = trpc.useContext()
  const deleteResultsMutation = trpc.results.deleteResults.useMutation({
    onMutate: () => {
      setIsDeleteLoading(true)
    },
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: async () => {
      await trpcContext.results.getResults.invalidate()
    },
    onSettled: () => {
      onDeleteResults(selectedResultsId.length)
      onClearSelection()
      setIsDeleteLoading(false)
      onClose()
    },
  })

  const workspaceId = bot?.workspaceId
  const botId = bot?.id

  const totalSelected = selectedResultsId.length

  const deleteResults = async () => {
    if (!workspaceId || !botId) return
    deleteResultsMutation.mutate({
      botId: botId,
      resultIds: selectedResultsId.join(','),
    })
  }

  const exportResultsToCSV = async () => {
    setIsExportLoading(true)

    const dataToUnparse = tableData.filter((data) => selectedResultsId.includes(data.id.plainText))

    const headerIds = parseColumnsOrder(bot?.resultsTablePreferences?.columnsOrder, resultHeader)
      .reduce<string[]>((currentHeaderIds, columnId) => {
        if (bot?.resultsTablePreferences?.columnsVisibility[columnId] === false)
          return currentHeaderIds
        const columnLabel = resultHeader.find((headerCell) => headerCell.id === columnId)?.id
        if (!columnLabel) return currentHeaderIds
        return [...currentHeaderIds, columnLabel]
      }, [])
      .concat(
        bot?.resultsTablePreferences?.columnsOrder
          ? resultHeader
            .filter(
              (headerCell) => !bot?.resultsTablePreferences?.columnsOrder.includes(headerCell.id),
            )
            .map((headerCell) => headerCell.id)
          : [],
      )

    const data = dataToUnparse.map<{ [key: string]: string }>((data) => {
      const newObject: { [key: string]: string } = {}
      headerIds?.forEach((headerId) => {
        const headerLabel = resultHeader.find(byId(headerId))?.label
        if (!headerLabel) return
        const newKey = parseUniqueKey(headerLabel, Object.keys(newObject))
        newObject[newKey] = data[headerId]?.plainText
      })
      return newObject
    })

    const csvData = new Blob([unparse(data)], {
      type: 'text/csv;charset=utf-8;',
    })
    const fileName = `quickbot-export_${new Date().toLocaleDateString().replaceAll('/', '-')}`
    const tempLink = document.createElement('a')
    tempLink.href = window.URL.createObjectURL(csvData)
    tempLink.setAttribute('download', `${fileName}.csv`)
    tempLink.click()
    setIsExportLoading(false)
  }

  return (
    <>
      <ButtonGroup variant="outline" isAttached={true} borderRadius="md" size="sm">
        <Button
          onClick={onClearSelection}
          isDisabled={totalSelected === 0}
        >
          {totalSelected} selected
        </Button>
        <IconButton
          aria-label="Export"
          icon={<DownloadIcon />}
          onClick={exportResultsToCSV}
          isLoading={isExportLoading}
          isDisabled={totalSelected === 0}
        />
        <IconButton
          aria-label="Delete"
          borderLeftRadius="none"
          icon={<TrashIcon />}
          onClick={onOpen}
          isLoading={isDeleteLoading}
          isDisabled={totalSelected === 0}
        />
      </ButtonGroup>
      <ConfirmModal
        isOpen={isOpen}
        onConfirm={deleteResults}
        onClose={onClose}
        onReject={onClose}
        message={
          <Text>
            You are about to delete{' '}
            <strong>
              {totalSelected} submission
              {totalSelected > 1 ? 's' : ''}
            </strong>
            . Are you sure you wish to continue?
          </Text>
        }
        confirmButtonLabel={'Delete'}
      />
    </>
  )
}
