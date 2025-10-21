import { UserTeamIcon, AlertIcon, BarChartIcon } from '@urbiport/icons'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useTranslate } from '@tolgee/react'
import React, { memo, useMemo } from 'react'
import UpgradePlan from '@/features/billing/components/UpgradePlan'
import { BillingPlanType } from '@quickbot.io/prisma'
import { Tooltip, Stack, HStack, SlideFade, Text, Box } from '@chakra-ui/react'
import { useGraphGroups } from '@/features/graph/hooks/useGraphGroups'

type AnalyticsFloatingBarProps = {
  dropOffRate: number
  totalDroppedUsers: number
  totalUsers: number
  tooltipLabel?: string
}

const AnalyticsBox = memo(
  ({
    dropOffRate,
    totalDroppedUsers,
    totalUsers,
    isBlurred = false,
    onClick,
  }: {
    dropOffRate: number
    totalDroppedUsers: number
    totalUsers: number
    isBlurred?: boolean
    onClick?: () => void
  }) => {
    const displayDropOffRate = dropOffRate ?? 0
    const displayTotalUsers = totalUsers ?? 0
    const displayDroppedUsers = totalDroppedUsers ?? 0

    return (
      <Stack
        direction="row"
        data-testid="drop-off-box"
        filter={isBlurred ? 'blur(2px)' : undefined}
        bgColor="red.50"
        borderRadius="md"
        p="3"
        justifyContent="space-between"
        alignItems="center"
        w="300px"
        spacing={0}
        cursor={onClick ? 'pointer' : 'auto'}
        border="2px solid"
        borderColor="red.400"
        _hover={{
          boxShadow: 'lg',
          borderColor: 'red.300',
          bgColor: 'red.100',
        }}
        transition="all 0.2s ease-in-out"
        onClick={onClick}
        tabIndex={0}
      >
        <HStack spacing={1} w="full">
          <UserTeamIcon size="12px" color="red.500" />
          <Text fontSize="xs" color="red.700" fontWeight="bold">
            {displayTotalUsers}
          </Text>
          <Text fontSize="2xs" color="red.600">
            total
          </Text>
        </HStack>
        <HStack spacing={1} w="full">
          <AlertIcon size="12px" color="red.500" />
          <Text fontSize="xs" color="red.700" fontWeight="bold">
            {displayDroppedUsers}
          </Text>
          <Text fontSize="2xs" color="red.600">
            left
          </Text>
        </HStack>
        <HStack spacing={1} w="full">
          <BarChartIcon size="12px" color="red.500" />
          <Text fontSize="xs" color="red.700" fontWeight="bold">
            {`${displayDropOffRate}%`}
          </Text>
          <Text fontSize="2xs" color="red.600">
            drop
          </Text>
        </HStack>
      </Stack>
    )
  },
)
AnalyticsBox.displayName = 'AnalyticsBox'

const AnalyticsFloatingBarComponent = ({
  dropOffRate,
  totalDroppedUsers,
  totalUsers,
  tooltipLabel,
}: AnalyticsFloatingBarProps) => {
  const { workspace } = useWorkspace()
  const { t } = useTranslate()
  const { isDraggingGraph } = useGraphGroups()

  const hasAnalytics = workspace?.billingPlan?.allowAnalytics
  const computedTooltip = useMemo(() => {
    if (tooltipLabel) return tooltipLabel
    return `${totalUsers} users reached this block. ${totalDroppedUsers} user${
      (totalDroppedUsers ?? 2) > 1 ? 's' : ''
    } left (${dropOffRate}% drop-off rate).`
  }, [tooltipLabel, totalUsers, totalDroppedUsers, dropOffRate])

  return (
    <Box
      position="absolute"
      left={0}
      bottom="-70px"
      zIndex={3}
      pointerEvents={isDraggingGraph ? 'none' : 'auto'}
    >
      <SlideFade in={true} unmountOnExit>
        {!hasAnalytics ? (
          <UpgradePlan
            excludedPlans={[BillingPlanType.FREE, BillingPlanType.PERSONAL]}
            trigger={({ onOpen }) => (
              <Tooltip
                label={t('billing.upgradeLimitLabel', {
                  type: t('billing.limitMessage.analytics'),
                })}
                placement="bottom"
                hasArrow
                isDisabled={isDraggingGraph}
              >
                <Box>
                  <AnalyticsBox
                    dropOffRate={100}
                    totalDroppedUsers={100}
                    totalUsers={100}
                    isBlurred
                    onClick={onOpen}
                  />
                </Box>
              </Tooltip>
            )}
          />
        ) : (
          <Tooltip label={computedTooltip} placement="bottom" hasArrow isDisabled={isDraggingGraph}>
            <Box>
              <AnalyticsBox
                dropOffRate={dropOffRate}
                totalDroppedUsers={totalDroppedUsers}
                totalUsers={totalUsers}
              />
            </Box>
          </Tooltip>
        )}
      </SlideFade>
    </Box>
  )
}

const MemoizedAnalyticsFloatingBar = memo(AnalyticsFloatingBarComponent)
MemoizedAnalyticsFloatingBar.displayName = 'AnalyticsFloatingBar'

export { MemoizedAnalyticsFloatingBar as AnalyticsFloatingBar }
