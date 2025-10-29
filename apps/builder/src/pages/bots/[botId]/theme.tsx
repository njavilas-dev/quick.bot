import { ThemePage } from '@/features/theme/components/ThemePage'
import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import { BotLayout } from '@/components/layouts/BotLayout'

const Page: NextPageWithLayout = () => {
  return <ThemePage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <BotLayout>{page}</BotLayout>
}

export default Page
