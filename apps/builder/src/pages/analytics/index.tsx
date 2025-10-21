import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import Layout from '@/components/layouts/Layout'
import { AnalyticsPage } from '@/features/analytics/components/AnalyticsPage'

const Page: NextPageWithLayout = () => {
  return <AnalyticsPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <Layout>{page}</Layout>
}

export default Page
