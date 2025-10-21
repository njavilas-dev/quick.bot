import { Stack, Flex, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { trpc } from '@/lib/trpc'
import { useTranslate } from '@tolgee/react'
import { useToast } from '@urbiport/ui'
import { useWorkspace } from '@/hooks/useWorkspace'
import { BotDndProvider } from '../BotDndProvider'
import { FolderContent } from './FolderContent'

export const FolderPage = () => {
  const { t } = useTranslate()
  const { showToast } = useToast()
  const router = useRouter()
  const { workspace } = useWorkspace()

  const { data: { folder } = {} } = trpc.folders.getFolder.useQuery(
    {
      folderId: router.query.id as string,
      workspaceId: workspace?.id as string,
    },
    {
      enabled: !!workspace && !!router.query.id,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      retry: 0,
      onError: (error) => {
        if (error.data?.httpStatus === 404) router.replace('/bots')
        showToast({
          detailsTitle: t('toast.details'),
          title: 'Folder not found',
        })
      },
    },
  )

  return (
    <Stack minH="100vh">
      <BotDndProvider>
        {!folder ? (
          <Flex flex="1">
            <Spinner mx="auto" />
          </Flex>
        ) : (
          <FolderContent folder={folder} />
        )}
      </BotDndProvider>
    </Stack>
  )
}
