import { FlowPage } from '@/features/editor/components/FlowPage'
import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import LayoutBotBuilder from '@/components/layouts/LayoutBotBuilder'

const Page: NextPageWithLayout = () => {
  return <FlowPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <LayoutBotBuilder>{page}</LayoutBotBuilder>
}

export default Page
