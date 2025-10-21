import React, { useEffect } from 'react'
import { IconButtonProps, useClipboard, IconButton } from '@chakra-ui/react'
import { CopyIcon } from '@urbiport/icons'

export type CopyButtonProps = {
  textToCopy: string
  onCopied?: () => void
} & Omit<IconButtonProps, 'aria-label'>

export const CopyButton = ({ textToCopy, onCopied, ...props }: CopyButtonProps) => {
  const { hasCopied, onCopy, setValue } = useClipboard(textToCopy)

  useEffect(() => {
    setValue(textToCopy)
  }, [setValue, textToCopy])

  return (
    <IconButton
      variant="ghost"
      aria-label=""
      icon={<CopyIcon />}
      isDisabled={hasCopied}
      color="text.light"
      onClick={() => {
        onCopy()
        if (onCopied) onCopied()
      }}
      {...props}
    />
  )
}
