import type { ReactNode } from 'react'
import type { NextPageWithLayout } from '@/pages/_app'
import { AnalyticsPage } from '@/features/analytics/components/AnalyticsPage'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const Page: NextPageWithLayout = () => {
  return <AnalyticsPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default Page
