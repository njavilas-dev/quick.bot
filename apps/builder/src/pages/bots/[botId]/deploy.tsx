import { DeployPage } from '@/features/publish/components/DeployPage'
import type { ReactNode } from 'react'
import type { NextPageWithLayout } from '@/pages/_app'
import { BotLayout } from '@/components/layouts/BotLayout'

const Page: NextPageWithLayout = () => {
  return <DeployPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <BotLayout>{page}</BotLayout>
}

export default Page
