import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import { InboxPage } from '@/features/inbox/components/InboxPage'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const Page: NextPageWithLayout = () => {
  return <InboxPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}
export default Page
