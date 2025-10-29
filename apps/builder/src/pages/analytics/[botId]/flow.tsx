import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import { AnalyticsFlowPage } from '@/features/analytics/components/AnalyticsFlowPage'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const Page: NextPageWithLayout = () => {
  return <AnalyticsFlowPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default Page
