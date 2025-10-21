import React from 'react'
import { AvatarProps } from '@quickbot.io/schemas'
import { useDisclosure } from '@chakra-ui/react'
import { ImageUploadContent } from '@/components/ImageUploadContent'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'

type Props = {
  uploadFileProps: FilePathUploadProps
  title: string
  avatarProps?: AvatarProps
  isDefaultCheck?: boolean
  onAvatarChange: (avatarProps: AvatarProps) => void
}

export const AvatarForm = ({
  uploadFileProps,
  title,
  avatarProps,
  isDefaultCheck = false,
  onAvatarChange,
}: Props) => {
  const { isOpen, onClose } = useDisclosure()
  const isChecked = avatarProps ? avatarProps.isEnabled : isDefaultCheck
  const handleOnCheck = (isEnabled: boolean) => onAvatarChange({ ...avatarProps, isEnabled })
  const handleImageUrl = (url: string) => onAvatarChange({ ...avatarProps, url })
  const popoverContainerRef = React.useRef<HTMLDivElement>(null)

  useOutsideClick({
    ref: popoverContainerRef,
    handler: onClose,
    isEnabled: isOpen,
  })

  return (
    <SwitchWithRelatedSettings
      boxPadding={0}
      boxMargin={0}
      label={title}
      withBorders={false}
      isVisible={true}
      defaultValue={isChecked}
      onChange={handleOnCheck}
    >
      <ImageUploadContent
        uploadFileProps={uploadFileProps}
        defaultValue={avatarProps?.url}
        onChange={handleImageUrl}
        imageSize="thumb"
      />
    </SwitchWithRelatedSettings>
  )
}
