import React, { useEffect, useRef } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { useChatMessages } from '../hooks/useChatMessages'
import { LoadingState, ErrorState, EmptyMessagesState } from './InboxStates'
import { MessageBubble } from './MessageBubble'

interface ChatHistoryProps {
  botId: string
  sessionId: string
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ botId, sessionId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, isLoading, isError, error } = useChatMessages({
    botId,
    sessionId,
    enabled: !!botId && !!sessionId,
  })

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  if (isLoading) return <LoadingState />
  if (isError)
    return <ErrorState error={error as unknown as Error} title="Error loading messages" />
  if (messages.length === 0) return <EmptyMessagesState />

  return (
    <Box h="full" overflowY="auto" p="5">
      <VStack spacing={6}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </VStack>
    </Box>
  )
}
