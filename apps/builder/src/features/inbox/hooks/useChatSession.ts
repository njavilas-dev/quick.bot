import { trpc } from '@/lib/trpc'

interface UseChatSessionOptions {
  botId: string
  resultId: string
  enabled?: boolean
}

export function useChatSession({ botId, resultId, enabled = true }: UseChatSessionOptions) {
  const query = trpc.inbox.getBotLastSession.useQuery(
    { botId, resultId },
    {
      enabled: enabled && !!botId && !!resultId,
      refetchInterval: 10000,
      staleTime: 5000,
    },
  )

  return {
    session: query.data?.session,
    theme: query.data?.theme,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
