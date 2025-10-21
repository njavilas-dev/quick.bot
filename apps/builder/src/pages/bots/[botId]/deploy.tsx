import { DeployPage } from '@/features/publish/components/DeployPage'
import type { ReactNode } from 'react'
import type { NextPageWithLayout } from '@/pages/_app'
import LayoutBotBuilder from '@/components/layouts/LayoutBotBuilder'

const Page: NextPageWithLayout = () => {
  return <DeployPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <LayoutBotBuilder>{page}</LayoutBotBuilder>
}

export default Page
