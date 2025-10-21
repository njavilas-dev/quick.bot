import { useHydration } from '@/hooks/useHydration'
import { ResetPasswordPage } from '@/features/auth/components/ResetPasswordPage'

export default function Page() {
  const isHydrated = useHydration()
  if (!isHydrated) return null
  return <ResetPasswordPage />
}
