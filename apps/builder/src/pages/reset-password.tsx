import { ResetPasswordPage } from '@/features/auth/components/ResetPasswordPage'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import type { ReactNode } from 'react'

function Page() {
  return <ResetPasswordPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AuthLayout>{page}</AuthLayout>
}

export default Page
