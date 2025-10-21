import { useHydration } from '@/hooks/useHydration'
import { VerifyEmailPage } from '@/features/auth/components/VerifyEmailPage'

export default function Page() {
  const isHydrated = useHydration()
  if (!isHydrated) return null
  return <VerifyEmailPage />
}
