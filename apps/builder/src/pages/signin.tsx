import { AuthLayout } from '@/components/layouts/AuthLayout'
import { SignInPage } from '@/features/auth/components/SignInPage'
import type { ReactNode } from 'react'

function Page() {
  return <SignInPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AuthLayout>{page}</AuthLayout>
}

export default Page
