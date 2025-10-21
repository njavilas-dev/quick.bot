import { useState } from 'react'
import { unparse } from 'papaparse'
import { trpc } from '@/lib/trpc'
import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Progress,
  Text,
  Alert,
} from '@chakra-ui/react'
import { TRPCError } from '@trpc/server'
import { DownloadIcon } from '@urbiport/icons'
import { FormControl, Switch, useToast } from '@urbiport/ui'
import { useBot } from '@/features/editor/providers/BotProvider'
import { parseResultHeader } from '@quickbot.io/results/parseResultHeader'
import { convertResultsToTableData } from '@quickbot.io/results/convertResultsToTableData'
import { parseColumnsOrder } from '@quickbot.io/results/parseColumnsOrder'
import { parseUniqueKey } from '@quickbot.io/lib/parseUniqueKey'
import { byId, isDefined } from '@quickbot.io/lib'
import { Bot } from '@quickbot.io/schemas'
import { parseBlockIdVariableIdMap } from '@quickbot.io/results/parseBlockIdVariableIdMap'
import { useTranslate } from '@tolgee/react'
import { useResults } from '../../ResultsProvider'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const ResultsTableModalExport = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslate()
  const { bot, publishedBot } = useBot()
  const workspaceId = bot?.workspaceId
  const botId = bot?.id
  const { showToast } = useToast()
  const { resultHeader: existingResultHeader, totalResults } = useResults()
  const trpcContext = trpc.useContext()
  const [isExportLoading, setIsExportLoading] = useState(false)
  const [exportProgressValue, setExportProgressValue] = useState(0)

  const [areDeletedBlocksIncluded, setAreDeletedBlocksIncluded] = useState(false)

  const { data: linkedBotsData } = trpc.getLinkedBots.useQuery(
    {
      botId: botId as string,
    },
    {
      enabled: isDefined(botId),
    },
  )

  const getAllResults = async () => {
    if (!workspaceId || !botId) return []
    const allResults = []
    let cursor: string | undefined
    setExportProgressValue(0)
    do {
      try {
        const { results, nextCursor } = await trpcContext.results.getResults.fetch({
          botId,
          limit: 100,
          cursor,
          timeFilter: 'allTime',
        })
        allResults.push(...results)
        setExportProgressValue((allResults.length / totalResults) * 100)
        cursor = nextCursor ?? undefined
      } catch (error) {
        showToast({
          detailsTitle: t('toast.details'),
          description: (error as TRPCError).message,
        })
        return []
      }
    } while (cursor)

    return allResults
  }

  const exportAllResultsToCSV = async () => {
    if (!publishedBot) return

    setIsExportLoading(true)

    const results = await getAllResults()

    if (!results.length) return setIsExportLoading(false)

    const resultHeader = areDeletedBlocksIncluded
      ? parseResultHeader(
          publishedBot,
          linkedBotsData?.bots as Pick<Bot, 'groups' | 'variables'>[],
          results,
        )
      : existingResultHeader

    const dataToUnparse = convertResultsToTableData({
      results,
      headerCells: resultHeader,
      blockIdVariableIdMap: parseBlockIdVariableIdMap(bot?.groups),
    })

    const headerIds = parseColumnsOrder(
      bot?.resultsTablePreferences?.columnsOrder,
      resultHeader,
    ).reduce<string[]>((currentHeaderIds, columnId) => {
      if (bot?.resultsTablePreferences?.columnsVisibility[columnId] === false)
        return currentHeaderIds
      const columnLabel = resultHeader.find((headerCell) => headerCell.id === columnId)?.id
      if (!columnLabel) return currentHeaderIds
      return [...currentHeaderIds, columnLabel]
    }, [])

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
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader />
        <ModalBody as={Stack} spacing="4">
          <FormControl
            direction="row"
            label={t('results.export.includeDeletedBlocks.label')}
            moreInfoTooltip={t('results.export.includeDeletedBlocks.tooltip')}
          >
            <Switch
              defaultValue={areDeletedBlocksIncluded}
              onChange={setAreDeletedBlocksIncluded}
            />
          </FormControl>
          {totalResults > 2000 ? (
            <Alert status="info">{t('results.export.warning.longTime')}</Alert>
          ) : (
            <Alert status="info">{t('results.export.warning.upToOneMinute')}</Alert>
          )}
          {isExportLoading && (
            <Stack>
              <Text>{t('results.export.progress.fetching')}</Text>
              <Progress value={exportProgressValue} borderRadius="md" />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter as={HStack}>
          <Button onClick={onClose} variant="ghost" size="sm">
            {t('results.export.cancel')}
          </Button>
          <Button
            colorScheme="blue"
            onClick={exportAllResultsToCSV}
            leftIcon={<DownloadIcon />}
            size="sm"
            isLoading={isExportLoading}
          >
            {t('results.export.start')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
