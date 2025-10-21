import { TemplatesPage } from '@/features/templates/components/TemplatesPage'
import type { NextPageWithLayout } from '@/pages/_app'
import Layout from '@/components/layouts/Layout'
import type { ReactNode } from 'react'

const Page: NextPageWithLayout = () => {
  return <TemplatesPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <Layout>{page}</Layout>
}

export default Page
