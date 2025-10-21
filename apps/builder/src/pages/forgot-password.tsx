import { useHydration } from '@/hooks/useHydration'
import { ForgotPasswordPage } from '@/features/auth/components/ForgotPasswordPage'

export default function Page() {
  const isHydrated = useHydration()
  if (!isHydrated) return null
  return <ForgotPasswordPage />
}
