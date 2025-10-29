import { useState, useMemo } from 'react'
import { trpc } from '@/lib/trpc'

interface UseChatSessionsListOptions {
  botId: string
  limit?: number
  enabled?: boolean
}

/**
 * Hook to fetch a paginated list of chat sessions
 */
export function useChatSessionsList({
  botId,
  limit = 25,
  enabled = true,
}: UseChatSessionsListOptions) {
  const [offset, setOffset] = useState(0)

  const query = trpc.inbox.listBotLastSessions.useQuery(
    { botId, limit, offset },
    {
      enabled: enabled && !!botId,
      staleTime: 1000 * 60 * 5,
    },
  )

  // Compute pagination controls
  const pagination = useMemo(() => {
    const paginationData = query.data?.pagination

    return {
      ...paginationData,
      goToNextPage: () => {
        if (paginationData?.hasMore && paginationData.nextOffset !== undefined) {
          setOffset(paginationData.nextOffset)
        }
      },
      goToPreviousPage: () => {
        if (offset > 0) {
          setOffset(Math.max(0, offset - limit))
        }
      },
      goToFirstPage: () => setOffset(0),
      hasPreviousPage: offset > 0,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: paginationData?.total ? Math.ceil(paginationData.total / limit) : 0,
    }
  }, [query.data, offset, limit])

  return {
    sessions: query.data?.sessions ?? [],
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
