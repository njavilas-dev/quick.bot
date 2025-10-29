import type { ReactNode } from 'react'
import type { NextPageWithLayout } from '@/pages/_app'
import { BotLayout } from '@/components/layouts/BotLayout'
import { SettingsPage } from '@/features/settings/SettingsPage'

const Page: NextPageWithLayout = () => {
  return <SettingsPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <BotLayout>{page}</BotLayout>
}

export default Page
