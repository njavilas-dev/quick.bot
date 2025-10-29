import { BotIcon } from '@/components/BotIcon'
import { useBot } from '@/features/editor/providers/BotProvider'
import { trpc } from '@/lib/trpc'
import { Text, HStack, Button, Stack } from '@chakra-ui/react'
import { PlanTag } from '@/features/billing/components/PlanTag'
import { HardDriveIcon } from '@urbiport/icons'
import { useRouter } from 'next/router'
import { type ReactNode, useState } from 'react'
import type { NextPageWithLayout } from '@/pages/_app'
import { BotLayout } from '@/components/layouts/BotLayout'
import { RadioButtons } from '@urbiport/ui'
import { useUser } from '@/hooks/useUser'

const Page: NextPageWithLayout = () => {
  const { push } = useRouter()
  const { user } = useUser()
  const { bot } = useBot()
  const { data: workspacesData } = trpc.workspace.listWorkspaces.useQuery(undefined, {
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
  const workspaces = workspacesData?.workspaces
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>()
  const { mutate, isLoading } = trpc.bot.importBot.useMutation({
    onSuccess: (data) => {
      push(`/bots/${data.bot.id}/flow`)
    },
  })

  const duplicateBot = (workspaceId: string) => {
    mutate({ workspaceId, bot: bot })
  }

  const updateSelectedWorkspaceId = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId)
  }

  return (
    <Stack w="full" justifyContent="center" pt="10" h="100vh" maxW="350px" mx="auto" spacing={4}>
      <Text>
        Choose a workspace to duplicate <strong>{bot?.name}</strong> in:
      </Text>
      <RadioButtons
        options={
          workspaces
            ? workspaces?.map((workspace) => ({
                value: workspace.id,
                label: (
                  <HStack w="full">
                    <BotIcon icon={workspace.icon ?? HardDriveIcon} size="sm" />
                    <Text>{workspace.name}</Text>
                    <PlanTag plan={workspace.billingPlan.key} />
                  </HStack>
                ),
              }))
            : []
        }
        value={selectedWorkspaceId}
        onSelect={updateSelectedWorkspaceId}
      />
      <Button
        isDisabled={!selectedWorkspaceId}
        onClick={() => duplicateBot(selectedWorkspaceId as string)}
        isLoading={isLoading}
        colorScheme="blue"
        size="sm"
      >
        Duplicate
      </Button>
    </Stack>
  )
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <BotLayout>{page}</BotLayout>
}

export default Page
