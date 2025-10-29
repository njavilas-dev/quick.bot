import { Box } from '@chakra-ui/react'
import React from 'react'
import { useInboxRouting } from '../hooks/useInboxRouting'
import { InboxViewer } from './InboxViewer'
import {
  LoadingState,
  EmptySessionsState,
  NoSelectionState,
} from './InboxStates'

export const InboxPage = () => {
  const { botId, sessionId, isLoading, hasNoSessions } = useInboxRouting()

  return (
    <Box w="full" h="full" bg="white" borderRadius="lg">
      {isLoading ? (
        <LoadingState />
      ) : hasNoSessions ? (
        <EmptySessionsState />
      ) : !sessionId ? (
        <NoSelectionState />
      ) : (
        <InboxViewer chatSessionId={sessionId} botId={botId} />
      )}
    </Box>
  )
}
