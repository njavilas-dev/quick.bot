import React, { useMemo } from 'react'
import { Flex } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { H3 } from '@urbiport/ui'
import { useChatSessions } from '@/features/inbox/hooks'
import { InboxSessionsList } from '@/features/inbox/components/InboxSessionsList'

interface InboxSidebarProps {
  upgradeButton?: React.ReactElement
}

const getCurrentInboxBotId = () => {
  if (typeof window === 'undefined') return ''
  const pathSegments = window.location.pathname.split('/').filter(Boolean)
  if (pathSegments[0] === 'inbox' && pathSegments.length >= 2) {
    return pathSegments[1]
  }
  return ''
}

const getCurrentChatSessionId = () => {
  if (typeof window === 'undefined') return ''
  const pathSegments = window.location.pathname.split('/').filter(Boolean)
  if (pathSegments[0] === 'inbox' && pathSegments.length >= 3) {
    return pathSegments[2]
  }
  return ''
}

export const InboxSidebar: React.FC<InboxSidebarProps> = ({ upgradeButton }) => {
  const router = useRouter()
  const botId = useMemo(() => getCurrentInboxBotId(), [router.asPath])
  const currentSessionId = useMemo(() => getCurrentChatSessionId(), [router.asPath])

  const { sessions, isLoading, isFetching, refetch } = useChatSessions({
    botId,
    limit: 50,
    enabled: !!botId,
  })

  const handleSessionClick = (sessionId: string) => {
    router.push(`/inbox/${botId}/${sessionId}`)
  }

  return (
    <Flex
      py={3}
      bg="bg.normal"
      direction="column"
      width="300px"
      borderRight="1px solid"
      borderColor="divider.light"
      gap={6}
    >
      <Flex mt={0} align="center" h="48px" px={4}>
        <H3>Inbox</H3>
      </Flex>

      <InboxSessionsList
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionClick={handleSessionClick}
        isLoading={isLoading}
        onRefresh={refetch}
        isRefetching={isFetching && !isLoading}
      />

      {upgradeButton && (
        <Flex
          borderTop="1px solid"
          borderColor="divider.light"
          alignContent="center"
          alignItems="center"
          mt="auto"
          pt={4}
          pb={2}
          px={6}
        >
          {upgradeButton}
        </Flex>
      )}
    </Flex>
  )
}
