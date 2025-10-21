import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import { AnalyticsFlowPage } from '@/features/analytics/components/AnalyticsFlowPage'
import Layout from '@/components/layouts/Layout'

const Page: NextPageWithLayout = () => {
  return (
    <AnalyticsFlowPage />
  )
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <Layout>{page}</Layout>
}

export default Page