import { AccountSecurityForm } from '@/features/account/components/AccountSecurityForm'
import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import Layout from '@/components/layouts/Layout'

const SecurityPage: NextPageWithLayout = () => {
  return <AccountSecurityForm />
}

SecurityPage.getLayout = function getLayout(page: ReactNode) {
  return <Layout>{page}</Layout>
}

export default SecurityPage
