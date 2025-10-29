import { ForgotPasswordPage } from '@/features/auth/components/ForgotPasswordPage'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import type { ReactNode } from 'react'

function Page() {
  return <ForgotPasswordPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AuthLayout>{page}</AuthLayout>
}

export default Page
