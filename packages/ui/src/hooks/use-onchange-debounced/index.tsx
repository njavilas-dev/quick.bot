import { useCallback, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'

type UseOnChangeDebouncedProps<T> = {
  onChange: (value: T) => void
  debounceTimeout?: number
}

export const useOnChangeDebounced = <T,>({
  onChange,
  debounceTimeout = 0,
}: UseOnChangeDebouncedProps<T>) => {
  const debounced = useDebouncedCallback(onChange, debounceTimeout)

  const handleChange = useCallback(
    (newValue: T) => {
      if (debounceTimeout > 0) {
        debounced(newValue)
      } else {
        onChange(newValue)
      }
    },
    [debounced, onChange, debounceTimeout]
  )

  useEffect(() => {
    return () => {
      debounced.flush()
    }
  }, [debounced])

  const flush = useCallback(() => {
    debounced.flush()
  }, [debounced])

  return {
    onChange: handleChange,
    flush,
  }
}