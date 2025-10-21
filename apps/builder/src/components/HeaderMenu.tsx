import React, { useCallback } from 'react'
import { HStack, Flex, Button, Box, Tag, Tooltip } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { WorkspaceDropdown } from '@/features/workspace/components/WorkspaceDropdown'
import { BotsDropdown } from '@/features/analytics/components/BotsDropdown'
import { AccountDropdown } from '@/features/account/components/AccountDropdown'
import UpgradePlan from '@/features/billing/components/UpgradePlan'
import { LoadingSave } from './LoadingSave'
import { useRouter } from 'next/router'
import { useWorkspaceRole } from '@/hooks/useWorkspaceRole'
import { getRoleLabel } from '@/features/workspace/helpers/getRoleLabel'
import { getRoleBadgeColor } from '@/features/workspace/helpers/getRoleBadgeColor'

export type LayoutProps = {
  hideWorkspaceDropdown?: boolean
}

export const HeaderMenu = ({ hideWorkspaceDropdown }: LayoutProps) => {
  const { t } = useTranslate()
  const router = useRouter()
  const { currentWorkspaceRole, isAdmin } = useWorkspaceRole()

  // Check if we're in analytics section
  const isAnalyticsSection = router.pathname.startsWith('/analytics')

  // Get current botId from path params
  const selectedBotId = typeof router.query.botId === 'string' ? router.query.botId : undefined

  const handleBotChange = useCallback((botId: string) => {
    // Determine the correct path based on current location
    if (router.pathname === '/analytics') {
      router.push(`/analytics/${botId}`)
    } else if (router.pathname === '/analytics/[botId]') {
      router.push(`/analytics/${botId}`)
    } else if (router.pathname === '/analytics/[botId]/flow') {
      router.push(`/analytics/${botId}/flow`)
    } else if (router.pathname === '/analytics/[botId]/answers') {
      router.push(`/analytics/${botId}/answers`)
    }
  }, [router])

  return (
    <Flex w="100%" justify="space-between" align="center">
      <Box flex="1" maxW="500px" style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
        {!hideWorkspaceDropdown && <WorkspaceDropdown />}
        {currentWorkspaceRole && (
          <Tooltip
            label={
              isAdmin
                ? 'You have full access to all workspace settings'
                : 'Limited access - contact your workspace admin for changes'
            }
            hasArrow
          >
            <Tag
              size="sm"
              colorScheme={getRoleBadgeColor(currentWorkspaceRole)}
              variant="subtle"
            >
              {getRoleLabel(currentWorkspaceRole)}
            </Tag>
          </Tooltip>
        )}
        {isAnalyticsSection && (
          <>
            / <BotsDropdown selectedBotId={selectedBotId} onBotChange={handleBotChange} />
          </>
        )}
        <LoadingSave />
      </Box>
      <HStack spacing={4}>
        <UpgradePlan
          trigger={({ onOpen }) => (
            <Button onClick={onOpen} colorScheme="teal" variant="solid">
              {t('upgrade').toUpperCase()}
            </Button>
          )}
        />
        <AccountDropdown />
      </HStack>
    </Flex>
  )
}
