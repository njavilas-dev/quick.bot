import {
  Stack,
  Box,
  BoxProps,
  HStack,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { ButtonUploadMedia } from '@/components/inputs'
import { useUser } from '@/hooks/useUser'
import { FormControl, InputText, ProfilePicture } from '@urbiport/ui'
import { FileUploadIcon } from '@urbiport/icons'
import { User } from '@quickbot.io/prisma'
import { useTranslate } from '@tolgee/react'

const ProfileForm: BoxProps = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
}

type FormData = Pick<User, 'name' | 'email' | 'image'>

export const AccountProfileForm: React.FC = () => {
  const { t } = useTranslate()
  const { user, updateUser } = useUser()

  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    email: user?.email || '',
    image: user?.image || '',
  })

  const handleChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [field]: value }
      // Only update user directly if it's NOT the email field
      if (field !== 'email') {
        updateUser(updatedData)
      }
      return updatedData
    })
  }

  const handleFileUploaded = async (url: string) => {
    setFormData((prev) => ({
      ...prev,
      image: url,
    }))
    updateUser({ image: url })
  }

  useEffect(() => {
    if (user) {
      const { name, email, image } = user
      setFormData({ name, email, image })
    }
  }, [user])

  return (
    <HStack spacing={4}>
      <Stack gap={8}>
        <ProfilePicture image={formData?.image || ''} />
        {user?.id && (
          <ButtonUploadMedia
            fileType="image"
            filePathProps={{
              userId: user.id,
              fileName: 'avatar',
            }}
            onFileUploaded={handleFileUploaded}
            variant="outline:primary"
            leftIcon={<FileUploadIcon color="brand.primary" />}
          >
            {t('account.myAccount.updatePhotoButton.label')}
          </ButtonUploadMedia>
        )}
      </Stack>
      <Box {...ProfileForm}>
        <FormControl>
          <InputText
            name="name"
            placeholder="Name"
            defaultValue={formData?.name || ''}
            onChange={handleChange('name')}
            debounceTimeout={800}
          />
        </FormControl>
        <FormControl>
          <InputText
            type="email"
            name="email"
            placeholder="Email"
            defaultValue={formData.email || ''}
            isReadOnly={true}
            isDisabled={true}
            bg="gray.50"
          />
        </FormControl>

      </Box>
    </HStack>
  )
}
