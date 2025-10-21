import { useTranslate } from '@tolgee/react'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { ButtonUploadMedia } from '../inputs'
import { FormControl, useToast } from '@urbiport/ui'
import { Box, Text } from '@chakra-ui/react'
import { FileUploadIcon } from '@urbiport/icons'
import { useState } from 'react'
import { compressFile } from '@/helpers/compressFile'
import { trpc } from '@/lib/trpc'

type Props = {
  onChange: (url: string) => void
  uploadFileProps?: FilePathUploadProps
}

export const UploadFileContent = ({ uploadFileProps, onChange }: Props) => {
  const { t } = useTranslate()
  const { showToast } = useToast()

  const [file, setFile] = useState<File>()
  const [isUploading, setIsUploading] = useState(false)

  if (!uploadFileProps) return null

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

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
          description: t(`toast.details.description.upload`),
        })
        return
      }

      onChange(data.fileUrl + '?v=' + Date.now())
    },
  })

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]

    if (file) {
      const fileName = file.name.toLowerCase()
      if (file.size > 3 * 1024 * 1024) {
        return
      }
      if (!['jpg', 'jpeg', 'png', 'svg'].some((ext) => fileName.endsWith(ext))) {
        return
      }
      try {
        const compressedFile = await compressFile(file)
        setFile(compressedFile)
        mutate({
          filePathProps: uploadFileProps,
          fileType: compressedFile.type,
        })
        // eslint-disable-next-line
      } catch (error) {
        showToast({
          detailsTitle: t('toast.details'),
          description: t(`toast.details.description.process`),
          status: 'error',
        })
      }
    }
  }


  return (
    <FormControl>
      <Box
        onDragOver={(e) => handleDragOver(e)}
        onDrop={(e) => handleDrop(e)}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        h={'150px'}
        border={'2px dashed #0000001F'}
        justifyContent={'center'}>
        <FileUploadIcon color={'brand.primary'} />
        <ButtonUploadMedia
          isLoading={isUploading}
          mt={'16px'}
          fileType="image"
          variant={'link'}
          textDecoration={'underline'}
          color={'brand.primary'}
          filePathProps={uploadFileProps}
          onFileUploaded={onChange}
        >
          {t('editor.header.uploadTab.uploadButton.label')}
        </ButtonUploadMedia>
        <Text mt={'8px'} fontSize={'14px'} color={'gray.700'}>
          {t('editor.subtitle.uploadTab.uploadButton.label')}
        </Text>
      </Box>
    </FormControl>
  )
}
