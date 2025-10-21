import React from 'react'
import { BotIcon, BotIconProps } from './BotIcon'
import { ImageUploadContent } from './ImageUploadContent'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { DropdownMenu } from '@urbiport/ui'
import { IconButton } from '@chakra-ui/react'

type Props = BotIconProps & {
  uploadFileProps: FilePathUploadProps
  onChange: (icon: string) => void
}

export const EditableBotIcon = ({ uploadFileProps, icon, size, onChange }: Props) => {
  if (typeof icon !== 'string' && icon !== null && icon !== undefined) {
    return <BotIcon icon={icon} />
  }

  return (
    <DropdownMenu
      placement="bottom-start"
      matchWidth={false}
      closeOnSelect={false}
      menuButton={<BotIcon icon={icon} size={size} />}
      menuButtonProps={{
        as: IconButton,
        p: 1,
        'aria-label': 'Edit icon',
      }}
    >
      <ImageUploadContent
        uploadFileProps={uploadFileProps}
        defaultValue={icon ?? ''}
        onChange={onChange}
      />
    </DropdownMenu>
  )
}
