import { SignUpPage } from '@/features/auth/components/SignUpPage'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import type { ReactNode } from 'react'

function Page() {
  return <SignUpPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AuthLayout>{page}</AuthLayout>
}

export default Page
