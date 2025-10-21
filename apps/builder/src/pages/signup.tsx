import { useHydration } from '@/hooks/useHydration'
import { SignUpPage } from '@/features/auth/components/SignUpPage'

export default function Page() {
  const isHydrated = useHydration()
  if (!isHydrated) return null
  return <SignUpPage />
}
