import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import { AccountLayout } from '@/components/layouts/AccountLayout'
import { AnalyticsPage } from '@/features/analytics/components/AnalyticsPage'

const Page: NextPageWithLayout = () => {
  return <AnalyticsPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default Page
