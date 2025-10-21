import { Avatar, Box } from '@chakra-ui/react'
import React from 'react'

type Props = {
  image: string
}

export const ProfilePicture = ({ image }: Props) => {
  return (
    <Box>
      <Avatar src={image} boxSize="full" maxWidth="128px" maxHeight="128px" borderRadius="lg" />
    </Box>
  )
}
