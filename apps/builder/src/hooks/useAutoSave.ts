import { useEffect, useRef } from 'react'
import { useDebounce } from 'use-debounce'
export const useAutoSave = <T>(
  {
    handler,
    item,
    debounceTimeout,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: () => Promise<any>
    item?: T
    debounceTimeout: number
  },
  dependencies: unknown[],
) => {
  const [debouncedItem] = useDebounce(item, debounceTimeout)
  const isSavingRef = useRef(false)
  useEffect(() => {
    const save = async () => {
      if (isSavingRef.current) return
      isSavingRef.current = true
      try {
        await handler()
      } finally {
        isSavingRef.current = false
      }
    }
    document.addEventListener('visibilitychange', save)
    return () => {
      document.removeEventListener('visibilitychange', save)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
  return useEffect(() => {
    const save = async () => {
      if (isSavingRef.current) return
      isSavingRef.current = true
      try {
        await handler()
      } finally {
        isSavingRef.current = false
      }
    }
    save()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedItem])
}
