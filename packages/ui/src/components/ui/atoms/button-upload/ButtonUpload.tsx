import React, { ChangeEvent, useState } from 'react'
import { Button, ButtonProps, chakra } from '@chakra-ui/react'

export type ButtonUploadProps = {
  accept?: string
  onFileSelected: (file: File) => Promise<void> | void
} & ButtonProps

export const ButtonUpload = ({
  accept = '*',
  onFileSelected,
  children,
  ...buttonProps
}: ButtonUploadProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    setIsLoading(true)

    Promise.resolve(onFileSelected(file)).finally(() => {
      setIsLoading(false)
      e.target.value = ''
    })
  }

  return (
    <>
      <chakra.input
        type="file"
        accept={accept}
        id="upload-input"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      <Button
        as="label"
        cursor="pointer"
        htmlFor="upload-input"
        isLoading={isLoading}
        {...buttonProps}
      >
        {children ?? 'Select File'}
      </Button>
    </>
  )
}
