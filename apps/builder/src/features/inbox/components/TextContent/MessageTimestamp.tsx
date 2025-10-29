import React from 'react'
import { Text } from '@chakra-ui/react'
import { formatTimestamp } from '../../utils/formatTimestamp'

interface MessageTimestampProps {
  date: Date
  align?: 'left' | 'right'
}

export const MessageTimestamp: React.FC<MessageTimestampProps> = ({
  date,
  align = 'left',
}) => {
  return (
    <Text
      fontSize="10px"
      color="current"
      mt="1"
      opacity="0.5"
      textAlign={align}
    >
      {formatTimestamp(date)}
    </Text>
  )
}
