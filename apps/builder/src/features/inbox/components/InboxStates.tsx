import React from 'react'
import { Flex, Spinner, Text } from '@chakra-ui/react'
import type { TRPCClientError } from '@trpc/client'

interface LoadingStateProps {
  text?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ text = 'Loading...' }) => (
  <Flex justify="center" align="center" boxSize="full" direction="column" gap={4}>
    <Spinner size="lg" />
    <Text>{text}</Text>
  </Flex>
)

interface ErrorStateProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: TRPCClientError<any> | Error | null
  title?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, title = 'Error loading data' }) => (
  <Flex justify="center" align="center" boxSize="full" direction="column" gap={4}>
    <Text fontSize="lg" color="red.500">
      {title}
    </Text>
    {error && (
      <Text fontSize="sm" color="gray.600">
        {error.message}
      </Text>
    )}
  </Flex>
)

export const EmptySessionsState: React.FC = () => (
  <Flex justify="center" align="center" boxSize="full" direction="column" gap={4}>
    <Text fontSize="lg" color="gray.600">
      No chat sessions found for this bot
    </Text>
  </Flex>
)

export const NoSelectionState: React.FC = () => (
  <Flex justify="center" align="center" boxSize="full" direction="column" gap={4}>
    <Text fontSize="lg" color="gray.600">
      Select a bot to view chat sessions
    </Text>
  </Flex>
)

export const EmptyMessagesState: React.FC = () => (
  <Flex justify="center" align="center" h="full">
    <Text fontSize="md" color="gray.500">
      No messages in this conversation yet
    </Text>
  </Flex>
)
