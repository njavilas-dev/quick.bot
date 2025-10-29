import { FlowPage } from '@/features/editor/components/FlowPage'
import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import { BotLayout } from '@/components/layouts/BotLayout'

const Page: NextPageWithLayout = () => {
  return <FlowPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <BotLayout>{page}</BotLayout>
}

export default Page
