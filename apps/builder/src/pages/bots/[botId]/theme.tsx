import { ThemePage } from '@/features/theme/components/ThemePage'
import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import LayoutBotBuilder from '@/components/layouts/LayoutBotBuilder'

const Page: NextPageWithLayout = () => {
  return <ThemePage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <LayoutBotBuilder>{page}</LayoutBotBuilder>
}

export default Page
