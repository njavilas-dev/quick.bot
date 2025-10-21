import { trpc } from '@/lib/trpc'
import { isDefined } from '@quickbot.io/lib'

export const useLogs = (
  botId: string,
  resultId: string | null,
  onError?: (error: string) => void,
) => {
  const { data, error } = trpc.results.getResultLogs.useQuery(
    {
      resultId: resultId ?? '',
      botId,
    },
    { enabled: isDefined(resultId) },
  )
  if (error && onError) onError(error.message)
  return {
    logs: data?.logs,
    isLoading: !error && !data,
  }
}
