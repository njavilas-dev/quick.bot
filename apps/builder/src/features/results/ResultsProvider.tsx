import { useToast } from '@urbiport/ui'
import { ResultHeaderCell, ResultWithAnswers, TableData, Bot } from '@quickbot.io/schemas'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useBot } from '../editor/providers/BotProvider'
import { useResultsQuery } from './hooks/useResultsQuery'
import { trpc } from '@/lib/trpc'
import { isDefined } from '@quickbot.io/lib'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { parseResultHeader } from '@quickbot.io/results/parseResultHeader'
import { convertResultsToTableData } from '@quickbot.io/results/convertResultsToTableData'
import { parseCellContent } from './helpers/parseCellContent'
import { timeFilterValues } from '../analytics/constants'
import { parseBlockIdVariableIdMap } from '@quickbot.io/results/parseBlockIdVariableIdMap'
import { useTranslate } from '@tolgee/react'

const resultsContext = createContext<{
  resultsList: { results: ResultWithAnswers[] }[] | undefined
  flatResults: ResultWithAnswers[]
  hasNextPage: boolean
  resultHeader: ResultHeaderCell[]
  totalResults: number
  tableData: TableData[]
  onDeleteResults: (totalResultsDeleted: number) => void
  onTimeFilterChange?: (timeFilter: (typeof timeFilterValues)[number]) => void
  fetchNextPage: () => void
  refetchResults: () => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const ResultsProvider = ({
  timeFilter,
  children,
  botId,
  totalResults,
  onDeleteResults,
  onTimeFilterChange,
}: {
  timeFilter: (typeof timeFilterValues)[number]
  children: ReactNode
  botId: string
  totalResults: number
  onDeleteResults: (totalResultsDeleted: number) => void
  onTimeFilterChange?: (timeFilter: (typeof timeFilterValues)[number]) => void
}) => {
  const { t } = useTranslate()
  const { publishedBot } = useBot()
  const { showToast } = useToast()
  const { data, fetchNextPage, hasNextPage, refetch } = useResultsQuery({
    timeFilter,
    botId,
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error,
      })
    },
  })

  const linkedBotIds =
    publishedBot?.groups
      .flatMap((group) => group.blocks)
      .reduce<string[]>((botIds, block) => {
        if (block.type !== LogicBlockType.BOT_LINK) return botIds
        const botId = block.options?.botId
        return isDefined(botId) && !botIds.includes(botId) && block.options?.mergeResults !== false
          ? [...botIds, botId]
          : botIds
      }, []) ?? []

  const { data: linkedBotsData } = trpc.getLinkedBots.useQuery(
    {
      botId: botId,
    },
    {
      enabled: linkedBotIds.length > 0,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const flatResults = useMemo(() => data?.flatMap((d) => d.results) ?? [], [data])

  const resultHeader = useMemo(
    () =>
      publishedBot
        ? parseResultHeader(
          publishedBot,
          linkedBotsData?.bots as Pick<Bot, 'groups' | 'variables'>[],
        )
        : [],
    [linkedBotsData?.bots, publishedBot],
  )

  const tableData = useMemo(
    () =>
      publishedBot
        ? convertResultsToTableData({
          results: data?.flatMap((d) => d.results) ?? [],
          headerCells: resultHeader,
          cellParser: parseCellContent,
          blockIdVariableIdMap: parseBlockIdVariableIdMap(publishedBot.groups),
        })
        : [],
    [publishedBot, data, resultHeader],
  )

  return (
    <resultsContext.Provider
      value={{
        resultsList: data,
        flatResults,
        hasNextPage: hasNextPage ?? true,
        tableData,
        resultHeader,
        totalResults,
        onDeleteResults,
        onTimeFilterChange,
        fetchNextPage,
        refetchResults: refetch,
      }}
    >
      {children}
    </resultsContext.Provider>
  )
}

export const useResults = () => useContext(resultsContext)
