import { AccountPreferencesForm } from '@/features/account/components/AccountPreferencesForm'
import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const PreferencesPage: NextPageWithLayout = () => {
  return <AccountPreferencesForm />
}

PreferencesPage.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default PreferencesPage
