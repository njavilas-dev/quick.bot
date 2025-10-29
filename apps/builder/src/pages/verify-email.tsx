import { VerifyEmailPage } from '@/features/auth/components/VerifyEmailPage'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import type { ReactNode } from 'react'

function Page() {
  return <VerifyEmailPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AuthLayout>{page}</AuthLayout>
}

export default Page
