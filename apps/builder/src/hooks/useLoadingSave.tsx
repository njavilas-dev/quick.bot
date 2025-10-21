import useLoadingSaveStore from '@/store/useLoadingSaveStore'
import { useTranslate } from '@tolgee/react'

export const useLoadingSave = () => {
  const { t } = useTranslate()

  const setIsVisible = useLoadingSaveStore((state) => state.setIsVisible)
  const setMessage = useLoadingSaveStore((state) => state.setMessage)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setLoadingSave = () => {
    setIsVisible(true)
    setMessage(t('editor.header.savingSpinner.label'))
  }

  return setLoadingSave
}   