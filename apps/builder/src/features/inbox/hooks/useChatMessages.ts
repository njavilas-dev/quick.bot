import { trpc } from '@/lib/trpc'

interface UseChatMessagesOptions {
  botId: string
  sessionId: string
  enabled?: boolean
}

export function useChatMessages({ botId, sessionId, enabled = true }: UseChatMessagesOptions) {
  const query = trpc.inbox.getChatMessages.useQuery(
    { botId, resultId: sessionId },
    {
      enabled: enabled && !!botId && !!sessionId,
      refetchInterval: 10000,
      staleTime: 1000 * 60 * 2,
    },
  )

  return {
    messages: query.data?.messages ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
