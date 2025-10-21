import React from 'react'
import { Box, Flex, Grid, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { BoxCard } from '@urbiport/ui'
import { SendEmailIcon } from '@urbiport/icons'
import { WorkspaceRole, BillingPlanType } from '@quickbot.io/prisma'
import { formatPrice } from '@quickbot.io/billing/helpers/formatPrice'
import { capitalize } from '@quickbot.io/lib'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useSubscription } from '@/hooks/useSubscription'
import { trpc } from '@/lib/trpc'
import { WorkspaceMember } from '@quickbot.io/schemas'

const BillingHeader = () => {
  const { workspace } = useWorkspace()

  const { subscriptionData, isLoading } = useSubscription(workspace)

  const { data } = trpc.workspace.listWorkspaceMembers.useQuery(
    {
      workspaceId: workspace?.id
    },
    {
      enabled: !!workspace?.id,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const members = data?.members ?? []
  const invitations = data?.invitations ?? []

  const workspacePlan = workspace?.billingPlan.key as BillingPlanType
  const workspaceMembersLimit = workspace?.billingPlan.membersLimit ?? 1
  const workspaceChatsLimit = workspace?.billingPlan.chatsLimit ?? 'inf'

  const workspacePlanPice = formatPrice(workspace?.billingPlan.price ?? 0, {
    currency: subscriptionData?.currency ?? 'usd',
    maxFractionDigits: 2,
  })
  const subscriptionStatus = subscriptionData?.status ?? 'Active'
  const subscriptionUsageChats = subscriptionData?.totalChatsUsed ?? 0
  const subscriptionNextPaymentDate = subscriptionData?.resetsAt?.toLocaleDateString()
  const subscriptionCancelAt = subscriptionData?.cancelAt?.toLocaleDateString()
  const workspaceUsageSeats = members.filter((member: WorkspaceMember) => member.role !== WorkspaceRole.GUEST).length + invitations.length

  const billingInfo = [
    {
      title: 'Plan:',
      content: workspacePlan,
    },
    {
      title: 'Method:',
      content: 'Stripe',
    },
    {
      title: 'Status:',
      content: capitalize(subscriptionStatus),
    },
    {
      title: 'Seats:',
      content: `${workspaceUsageSeats} / ${workspaceMembersLimit}`,
    },
    {
      title: 'Conversations:',
      content: `${subscriptionUsageChats} / ${workspaceChatsLimit}`,
    },
    {
      title: subscriptionCancelAt ? 'Cancel date:' : 'Renew on:',
      content: subscriptionCancelAt ?? subscriptionNextPaymentDate,
    },
  ]

  return (
    <BoxCard>
      <Flex direction={['column', 'row']} alignItems="center" gap="48px">
        <Grid
          flexBasis={['100%', '58%']}
          templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
          gap="16px"
        >
          {billingInfo.map((item, index) => {
            return (
              <Grid key={index}>
                <Box display="flex" flexDirection="column">
                  <HStack
                    spacing={2}
                    p={4}
                    bg="gray.50"
                    borderRadius="lg"
                    justifyContent="space-between"
                  >
                    <Text color="text.light">{item.title}</Text>
                    {isLoading ? (
                      <Skeleton height="1em" width="4em" />
                    ) : (
                      <Text color="text.normal" fontWeight="semibold">
                        {item.content}
                      </Text>
                    )}
                  </HStack>
                </Box>
              </Grid>
            )
          })}
        </Grid>

        <Box flexBasis="33%" height="128px">
          <HStack
            p={4}
            spacing={1}
            width="max-content"
            bg="green.50"
            borderRadius="lg"
            height="100%"
          >
            <VStack spacing={1} p={4} bg="green.100" borderRadius="md">
              <SendEmailIcon color="brand.primary" />
            </VStack>
            <VStack ml={4} spacing={1} align="flex-start">
              <Text fontSize="3xl" color="text.normal" fontWeight="medium" lineHeight="1">
                {workspacePlanPice}
              </Text>
              <Text fontSize="xs" color="text.light">
                Next payment
              </Text>
            </VStack>
          </HStack>
        </Box>
      </Flex>
    </BoxCard>
  )
}

export default BillingHeader
