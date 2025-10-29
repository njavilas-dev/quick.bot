import { AccountSecurityForm } from '@/features/account/components/AccountSecurityForm'
import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const SecurityPage: NextPageWithLayout = () => {
  return <AccountSecurityForm />
}

SecurityPage.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default SecurityPage
