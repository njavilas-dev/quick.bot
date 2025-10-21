import type { ReactNode } from 'react'
import type { NextPageWithLayout } from '@/pages/_app'
import { AnalyticsPage } from '@/features/analytics/components/AnalyticsPage'
import Layout from '@/components/layouts/Layout'

const Page: NextPageWithLayout = () => {
  return (
    <AnalyticsPage />
  )
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <Layout>{page}</Layout>
}

export default Page
