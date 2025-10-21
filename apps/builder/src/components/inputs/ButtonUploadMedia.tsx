import { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { trpc } from '@/lib/trpc'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { compressFile } from '@/helpers/compressFile'
import { useToast, ButtonUploadProps, ButtonUpload } from '@urbiport/ui'

type ButtonUploadMediaProps = {
  fileType: 'image' | 'audio'
  filePathProps: FilePathUploadProps
  onFileUploaded: (url: string) => void
} & Omit<ButtonUploadProps, 'onFileSelected'>

export const ButtonUploadMedia = ({
  fileType,
  filePathProps,
  onFileUploaded,
  children,
  ...props
}: ButtonUploadMediaProps) => {
  const { t } = useTranslate()
  const { showToast } = useToast()
  const [file, setFile] = useState<File>()
  const [isUploading, setIsUploading] = useState(false)

  const { mutate } = trpc.generateUploadUrl.useMutation({
    onSettled: () => {
      setIsUploading(false)
    },
    onSuccess: async (data) => {
      if (!file) return

      const formData = new FormData()
      Object.entries(data.formData).forEach(([key, value]) => {
        formData.append(key, value)
      })
      formData.append('file', file)

      const upload = await fetch(data.presignedUrl, {
        method: 'POST',
        body: formData,
      })

      if (!upload.ok) {
        showToast({
          detailsTitle: t('toast.details'),
          description: 'Error while trying to upload the file.',
        })
        return
      }

      onFileUploaded(data.fileUrl + '?v=' + Date.now())
    },
  })

  const handleFileSelected = async (file: File) => {
    setIsUploading(true)

    try {
      const compressedFile = await compressFile(file)
      setFile(compressedFile)
      mutate({
        filePathProps,
        fileType: compressedFile.type,
      })
      // eslint-disable-next-line
    } catch (error) {
      showToast({
        detailsTitle: t('toast.details'),
        description: 'Failed to process the file.',
        status: 'error',
      })
    }
  }

  return (
    <ButtonUpload
      accept={fileType === 'image' ? 'image/*' : 'audio/*'}
      onFileSelected={handleFileSelected}
      isLoading={isUploading}
      {...props}
    >
      {children}
    </ButtonUpload>
  )
}
