import { trpc } from '@/lib/trpc'

export const useBots = ({
  folderId,
  workspaceId,
  onError,
}: {
  workspaceId?: string
  folderId?: string | 'root'
  onError: (error: Error) => void
}) => {
  const { data, isLoading, refetch } = trpc.bot.listBots.useQuery(
    {
      workspaceId: workspaceId as string,
      folderId,
    },
    {
      enabled: !!workspaceId,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        onError(new Error(error.message))
      },
    },
  )
  return {
    bots: data?.bots,
    isLoading,
    refetch,
  }
}
