import React from 'react'
import { useRouter } from 'next/router'
import { Text, HStack } from '@chakra-ui/react'
import { WorkspaceDropdown } from '@/features/workspace/components/WorkspaceDropdown'
import { BotsDropdown } from '@/components/BotsDropdown'
import { BotSectionMenu } from '@/components/BotSectionMenu'
import { LoadingSave } from '@/components/LoadingSave'

export const Breadcrumbs = () => {
  const router = useRouter()
  const isBotPage = router.pathname.match(/^\/bots\/[^/]+\/[^/]+$/) !== null
  const isAnalyticsPage = router.pathname.startsWith('/analytics')
  const isInboxPage = router.pathname.startsWith('/inbox')

  return (
    <HStack spacing={1} align="center">
      {!isBotPage && !isAnalyticsPage && !isInboxPage && <WorkspaceDropdown />}
      {(isBotPage || isAnalyticsPage || isInboxPage) && (
        <>
          <BotsDropdown />
          <Text color="gray.400" px={1}>
            /
          </Text>
          <BotSectionMenu />
        </>
      )}
      <LoadingSave />
    </HStack>
  )
}
