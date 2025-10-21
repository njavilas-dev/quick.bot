import { SignInPage } from '@/features/auth/components/SignInPage'
import { useHydration } from '@/hooks/useHydration'

export default function Page() {
  const isHydrated = useHydration()
  if (!isHydrated) return null
  return <SignInPage />
}
