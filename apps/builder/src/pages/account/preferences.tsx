import { AccountPreferencesForm } from '@/features/account/components/AccountPreferencesForm'
import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import Layout from '@/components/layouts/Layout'

const PreferencesPage: NextPageWithLayout = () => {
  return <AccountPreferencesForm />
}

PreferencesPage.getLayout = function getLayout(page: ReactNode) {
  return <Layout>{page}</Layout>
}

export default PreferencesPage
