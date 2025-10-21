import type { ReactNode } from 'react'
import type { NextPageWithLayout } from '@/pages/_app'
import LayoutBotBuilder from '@/components/layouts/LayoutBotBuilder'
import { SettingsPage } from '@/features/settings/SettingsPage'

const Page: NextPageWithLayout = () => {
  return <SettingsPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <LayoutBotBuilder>{page}</LayoutBotBuilder>
}

export default Page
