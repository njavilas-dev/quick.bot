import React, { useEffect, useState } from 'react'
import { LogsModal } from './LogsModal'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useResults } from '../ResultsProvider'
import { ResultModal } from './ResultModal'
import { ResultsTable } from './table/ResultsTable'
import { useRouter } from 'next/router'

export const ResultsTableContainer = () => {
  const { query } = useRouter()
  const { flatResults: results, fetchNextPage, hasNextPage, resultHeader, tableData } = useResults()
  const { bot, publishedBot } = useBot()
  const [inspectingLogsResultId, setInspectingLogsResultId] = useState<string | null>(null)
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null)

  const handleLogsModalClose = () => setInspectingLogsResultId(null)

  const handleResultModalClose = () => setExpandedResultId(null)

  const handleLogOpenIndex = (index: number) => () => {
    if (!results[index]) return
    setInspectingLogsResultId(results[index].id)
  }

  const handleResultExpandIndex = (index: number) => () => {
    if (!results[index]) return
    setExpandedResultId(results[index].id)
  }

  useEffect(() => {
    if (query.id) setExpandedResultId(query.id as string)
  }, [query.id])

  return (
    <>
      {bot && (
        <ResultsTable
          preferences={bot.resultsTablePreferences ?? undefined}
          resultHeader={resultHeader}
          data={tableData}
          onScrollToBottom={fetchNextPage}
          hasMore={hasNextPage}
          onLogOpenIndex={handleLogOpenIndex}
          onResultExpandIndex={handleResultExpandIndex}
        />
      )}
      {publishedBot && (
        <LogsModal
          botId={publishedBot?.botId}
          resultId={inspectingLogsResultId}
          onClose={handleLogsModalClose}
        />
      )}
      <ResultModal resultId={expandedResultId} onClose={handleResultModalClose} />
    </>
  )
}
