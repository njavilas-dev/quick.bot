import React from 'react'
import { Box } from '@chakra-ui/react'
import { useChatSession } from '../hooks/useChatSession'
import { ChatHistory } from './ChatHistory'
import { LoadingState, ErrorState } from './InboxStates'

interface InboxViewerProps {
  chatSessionId: string
  botId: string
}

export const InboxViewer: React.FC<InboxViewerProps> = ({ chatSessionId, botId }) => {
  const { isLoading, isError, error } = useChatSession({
    botId,
    resultId: chatSessionId,
    enabled: !!botId && !!chatSessionId,
  })

  if (isError) {
    return <ErrorState error={error as unknown as Error} title="Error loading session" />
  }
  if (isLoading) {
    return <LoadingState text="Loading session data..." />
  }

  return (
    <Box h="full" w="full">
      <ChatHistory botId={botId} sessionId={chatSessionId} />
    </Box>
  )
}
