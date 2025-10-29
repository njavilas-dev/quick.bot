import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { isValidSessionId } from '../helpers/validation'
import { useChatSessionsList } from './useChatSessionsList'

export function useInboxRouting() {
  const router = useRouter()
  const { botId, chatSessionId } = router.query

  const selectedBotId = typeof botId === 'string' ? botId : ''
  const rawChatSessionId = typeof chatSessionId === 'string' ? chatSessionId : ''
  const selectedSessionId = isValidSessionId(rawChatSessionId) ? rawChatSessionId : ''

  // If we have a valid sessionId from the URL, we don't need to fetch sessions
  const shouldFetchSessions = !!selectedBotId && !selectedSessionId && router.isReady

  const { sessions, isLoading } = useChatSessionsList({
    botId: selectedBotId,
    limit: 1,
    enabled: shouldFetchSessions,
  })

  useEffect(() => {
    if (isLoading || selectedSessionId || !router.isReady) return
    if (selectedBotId && sessions.length > 0) {
      const latestSession = sessions[0]
      router.replace(`/inbox/${selectedBotId}/${latestSession.id}`)
    }
  }, [selectedBotId, selectedSessionId, sessions, isLoading, router])

  return {
    botId: selectedBotId,
    sessionId: selectedSessionId,
    isLoading: !router.isReady || (shouldFetchSessions && isLoading),
    hasNoSessions: router.isReady && !isLoading && selectedBotId && sessions.length === 0 && !selectedSessionId,
  }
}
