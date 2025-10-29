import { useMemo, useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useToast } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'

interface UseChatSessionsOptions {
  botId: string
  resultId?: string
  limit?: number
  enabled?: boolean
}

export const useChatSessions = ({
  botId,
  resultId,
  limit = 25,
  enabled = true,
}: UseChatSessionsOptions) => {
  const { t } = useTranslate()
  const { showToast } = useToast()
  const [offset, setOffset] = useState(0)

  // Determine which query to use based on resultId
  const isSingleSession = !!resultId
  const isListSessions = !resultId

  // Query for list of sessions
  const {
    data: listData,
    refetch: refetchList,
    isLoading: isLoadingList,
    isFetching: isFetchingList,
    isError: isErrorList,
    error: errorList,
  } = trpc.inbox.listBotLastSessions.useQuery(
    { botId, limit, offset },
    {
      enabled: enabled && !!botId && isListSessions,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          description: error.message,
          status: 'error',
        })
      },
    },
  )

  // Query for single session
  const {
    data: singleData,
    refetch: refetchSingle,
    isLoading: isLoadingSingle,
    isFetching: isFetchingSingle,
    isError: isErrorSingle,
    error: errorSingle,
  } = trpc.inbox.getBotLastSession.useQuery(
    { botId, resultId: resultId! },
    {
      enabled: enabled && !!botId && isSingleSession,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          description: error.message,
          status: 'error',
        })
      },
    },
  )

  // Memoized values for list
  const sessions = useMemo(() => listData?.sessions ?? [], [listData?.sessions])
  const pagination = useMemo(() => listData?.pagination, [listData?.pagination])

  // Single session value
  const session = singleData?.session
  const theme = singleData?.theme

  // Pagination controls
  const goToNextPage = () => {
    if (pagination?.hasMore && pagination.nextOffset !== undefined) {
      setOffset(pagination.nextOffset)
    }
  }

  const goToPreviousPage = () => {
    if (offset > 0) {
      const newOffset = Math.max(0, offset - limit)
      setOffset(newOffset)
    }
  }

  const goToFirstPage = () => {
    setOffset(0)
  }

  const hasNextPage = pagination?.hasMore ?? false
  const hasPreviousPage = offset > 0
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = pagination?.total ? Math.ceil(pagination.total / limit) : 0

  // Unified return based on mode
  return {
    // Single session mode (when resultId is provided)
    session,
    theme,
    refetchSession: refetchSingle,

    // List mode (when resultId is not provided)
    sessions,
    pagination,
    refetchSessions: refetchList,

    // Pagination controls (list mode only)
    offset,
    setOffset,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    hasNextPage,
    hasPreviousPage,
    currentPage,
    totalPages,

    // Common states
    isLoading: isSingleSession ? isLoadingSingle : isLoadingList,
    isFetching: isSingleSession ? isFetchingSingle : isFetchingList,
    isError: isSingleSession ? isErrorSingle : isErrorList,
    error: isSingleSession ? errorSingle : errorList,
    refetch: isSingleSession ? refetchSingle : refetchList,
  }
}
