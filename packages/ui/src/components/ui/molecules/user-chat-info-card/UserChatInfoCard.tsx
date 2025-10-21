import { Skeleton, Stack, Text } from '@chakra-ui/react'
import React from 'react'

type Props = {
  title: string
  content: number | string
  loading?: boolean
  conversionPercentage?: number | string
}

export const UserChatInfoCard = ({ title, loading, content, conversionPercentage, ...props }: Props) => {
  return (
    <Stack spacing={4} flexGrow={1} {...props}>
      <Text color="text.light" fontWeight="medium">
        {title}
      </Text>
      {!loading ? (
        <Stack spacing={1}>
          <Text fontSize="34px" color="text.normal" fontWeight="medium">
            {content}
          </Text>
          {conversionPercentage !== undefined && (
            <Text fontSize="14px" color="green.500" fontWeight="semibold">
              {conversionPercentage}
            </Text>
          )}
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Skeleton width="30%" height="20px" />
          {conversionPercentage !== undefined && (
            <Skeleton width="40%" height="14px" />
          )}
        </Stack>
      )}
    </Stack>
  )
}
