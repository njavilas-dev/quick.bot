import {
  Stack,
  Flex,
  Text,
  HStack,
  Tooltip,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react'
import { AlertIcon } from '@urbiport/icons'
import { useTranslate } from '@tolgee/react'
import { parseNumberWithCommas } from '@quickbot.io/lib'
import { useSubscription } from '@/hooks/useSubscription'
import { WorkspaceInApp } from '@/hooks/useWorkspace'

type Props = {
  workspace: WorkspaceInApp
}

export const WorkspacePlanProgressBar = ({ workspace }: Props) => {
  const { t } = useTranslate()
  const { subscriptionData, isLoading } = useSubscription(workspace)

  const workspaceChatsLimit = workspace?.billingPlan.chatsLimit ?? 'inf'
  const subscriptionUsageChats = subscriptionData?.totalChatsUsed ?? 0
  const chatsPercentage =
    workspaceChatsLimit === 'inf'
      ? 0
      : Math.round((subscriptionUsageChats / workspaceChatsLimit) * 100)
  const subscriptionNextPaymentDate = subscriptionData?.resetsAt?.toLocaleDateString()
  const subscriptionCancelAt = subscriptionData?.cancelAt?.toLocaleDateString()

  return (
    <Stack spacing={6}>
      <Stack spacing={3}>
        <Flex justifyContent="center">
          <HStack>
            {chatsPercentage >= 80 && (
              <Tooltip
                placement="top"
                borderRadius="md"
                p="3"
                label={
                  <Text>
                    {t('billing.usage.conversations.alert.soonReach')}
                    <br />
                    <br />
                    {t('billing.usage.conversations.alert.updatePlan')}
                  </Text>
                }
              >
                <span>
                  <AlertIcon color="alert.warning.bg" />
                </span>
              </Tooltip>
            )}
            <Text fontSize="sm" color="text.light">
              {subscriptionCancelAt ? 'Cancel date:' : 'Renew on:'}{' '}
              {subscriptionCancelAt ?? subscriptionNextPaymentDate}
            </Text>
          </HStack>
        </Flex>

        <CircularProgress
          value={chatsPercentage}
          isIndeterminate={isLoading}
          color="brand.primary"
          trackColor="green.100"
          size="75%"
          display="flex"
          justifyContent="center"
        >
          <CircularProgressLabel fontSize="2em">
            {parseNumberWithCommas(subscriptionUsageChats)} /{' '}
            {workspaceChatsLimit === 'inf'
              ? t('billing.usage.unlimited')
              : parseNumberWithCommas(workspaceChatsLimit)}
          </CircularProgressLabel>
        </CircularProgress>
      </Stack>
    </Stack>
  )
}
