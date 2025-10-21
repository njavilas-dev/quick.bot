import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export const useQueryToken = () => {

  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = router.query.token?.toString() ?? null
    setToken(token)
  }, [router.query])

  return token
}

export default useQueryToken