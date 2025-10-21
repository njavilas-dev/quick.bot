import { timeFilterValues } from '@/features/analytics/constants'
import { trpc } from '@/lib/trpc'

type Params = {
  timeFilter: (typeof timeFilterValues)[number]
  botId: string
  onError?: (error: string) => void
}

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export const useResultsQuery = ({ timeFilter, botId, onError }: Params) => {
  const { data, error, fetchNextPage, hasNextPage, refetch, isFetchingNextPage } =
    trpc.results.getResults.useInfiniteQuery(
      {
        timeZone,
        timeFilter,
        botId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    )

  if (error && onError) onError(error.message)
  return {
    data: data?.pages,
    isLoading: !error && !data,
    fetchNextPage: () => {
      if (!isFetchingNextPage && hasNextPage) {
        return fetchNextPage()
      }
      return Promise.resolve()
    },
    hasNextPage,
    refetch,
    isFetchingNextPage,
  }
}
