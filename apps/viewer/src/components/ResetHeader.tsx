import React from 'react'
import { RepeatIcon } from '@urbiport/icons'
import { wipeExistingChatStateInStorage } from '@urbiport/js/src/utils/storage'

type MinimalHeaderProps = {
  className?: string
  publicId: string | null
  onReset?: () => void
}

export const ResetHeader: React.FC<MinimalHeaderProps> = ({ className, publicId, onReset }) => {
  const handleReset = () => {
    if (publicId) {
      wipeExistingChatStateInStorage(publicId)
    }

    onReset?.()
    window.location.reload()
  }

  return (
    <header
      className={
        'fixed top-0 right-0 z-50 w-full flex items-center justify-end p-3 sm:p-4 pointer-events-none ' +
        (className ?? '')
      }
      aria-label="Viewer header"
    >
      <div className="pointer-events-auto">
        <button
          type="button"
          aria-label="Reset"
          onClick={handleReset}
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-black/20 bg-white/80 backdrop-blur hover:bg-white shadow-sm active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-black/20 flex items-center justify-center"
        >
          <RepeatIcon size="20px" color="rgba(0, 0, 0, 0.7)" />
        </button>
      </div>
    </header>
  )
}

export default ResetHeader
