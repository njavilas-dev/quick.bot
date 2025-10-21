import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import Layout from '@/components/layouts/Layout'
import { ResultsTableContainer } from '@/features/results/components/ResultsTableContainer'
import { ResultsProvider } from '@/features/results/ResultsProvider'
import { useRouter } from 'next/router'
import { useAnalyticsStats } from '@/features/analytics/hooks/useAnalyticsStats'

const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { botId } = router.query
  const selectedBotId = typeof botId === 'string' ? botId : ''

  const { stats, timeFilter, setTimeFilter, refetch } = useAnalyticsStats({
    botId: selectedBotId,
    enabled: !!selectedBotId
  })

  const handleDeletedResults = () => {
    if (!stats) return
    refetch()
  }

  return (
    <ResultsProvider
      timeFilter={timeFilter}
      botId={selectedBotId}
      totalResults={stats?.totalStarts ?? 0}
      onDeleteResults={handleDeletedResults}
      onTimeFilterChange={setTimeFilter}
    >
      <ResultsTableContainer />
    </ResultsProvider>
  )
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <Layout>{page}</Layout>
}

export default Page
