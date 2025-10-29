import { TemplatesPage } from '@/features/templates/components/TemplatesPage'
import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const Page: NextPageWithLayout = () => {
  return <TemplatesPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default Page
