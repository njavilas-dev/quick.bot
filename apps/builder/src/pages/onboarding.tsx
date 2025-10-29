import { OnboardingPage } from '@/features/onboarding/components/OnboardingPage'
import { AccountLayout } from '@/components/layouts/AccountLayout'
import type { ReactNode } from 'react'

function Page() {
  return <OnboardingPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default Page
