import React, { useState, useMemo } from 'react'
import { Flex, Text, Badge, Avatar, VStack, HStack, Icon, IconButton, Button, MenuItem } from '@chakra-ui/react'
import { DropdownMenu } from '@urbiport/ui'
import { PhoneIcon, GlobeIcon, RepeatIcon, ChevronDownIcon } from '@urbiport/icons'

interface SessionMetadata {
  currentBlockId?: string
  channel: 'web' | 'whatsapp'
  whatsappNumber?: string
  lastMessage?: string
}

interface Session {
  id: string
  createdAt: Date
  updatedAt: Date
  isReplying?: boolean
  metadata?: SessionMetadata
}

interface InboxSessionsListProps {
  sessions: Session[]
  currentSessionId: string
  onSessionClick: (sessionId: string) => void
  isLoading?: boolean
  onRefresh?: () => void
  isRefetching?: boolean
}

type ChannelFilter = 'all' | 'web' | 'whatsapp'

const getTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(date).toLocaleDateString()
}

export const InboxSessionsList: React.FC<InboxSessionsListProps> = ({
  sessions,
  currentSessionId,
  onSessionClick,
  isLoading,
  onRefresh,
  isRefetching = false,
}) => {
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all')

  const filterOptions = useMemo(
    () => [
      { label: 'All Channels', value: 'all' },
      { label: 'Web', value: 'web' },
      { label: 'WhatsApp', value: 'whatsapp' },
    ],
    [],
  )

  // Filter sessions by channel
  const filteredSessions = sessions.filter((session) => {
    if (channelFilter === 'all') return true
    return session.metadata?.channel === channelFilter
  })

  if (isLoading) {
    return (
      <Flex p={4} justify="center" align="center">
        <Text color="text.light" fontSize="sm">
          Loading sessions...
        </Text>
      </Flex>
    )
  }

  const renderHeader = () => {
    const selectedOption = filterOptions.find((opt) => opt.value === channelFilter)

    return (
      <Flex
        direction="row"
        gap={2}
        px={2}
        py={2}
        borderBottom="1px solid"
        borderColor="divider.light"
        bg="white"
        position="sticky"
        top={0}
        zIndex={1}
        align="center"
        justify="space-between"
      >
        <DropdownMenu
          placement="bottom-start"
          matchWidth={false}
          menuButton={selectedOption?.label || 'All Channels'}
          menuButtonProps={{
            'aria-label': 'Filter by channel',
            rightIcon: <ChevronDownIcon />,
            variant: 'outline',
            size: 'sm',
          }}
        >
          {filterOptions.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => setChannelFilter(option.value as ChannelFilter)}
              aria-selected={channelFilter === option.value ? 'true' : 'false'}
            >
              <HStack w="100%">
                {option.value === 'whatsapp' && (
                  <Icon as={PhoneIcon} boxSize={4} color="green.500" />
                )}
                {option.value === 'web' && (
                  <Icon as={GlobeIcon} boxSize={4} color="blue.500" />
                )}
                <Text>{option.label}</Text>
              </HStack>
            </MenuItem>
          ))}
        </DropdownMenu>

        {onRefresh && (
          <IconButton
            aria-label="Refresh sessions"
            icon={<RepeatIcon />}
            size="sm"
            variant="outline"
            onClick={onRefresh}
            isLoading={isRefetching}
          />
        )}
      </Flex>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <>
        {renderHeader()}
        <Flex p={4} justify="center" align="center">
          <Text color="text.light" fontSize="sm">
            No chat sessions
          </Text>
        </Flex>
      </>
    )
  }

  if (filteredSessions.length === 0) {
    return (
      <>
        {renderHeader()}
        <Flex p={4} justify="center" align="center">
          <Text color="text.light" fontSize="sm">
            No {channelFilter} sessions
          </Text>
        </Flex>
      </>
    )
  }

  return (
    <Flex direction="column" h="full" overflowY="hidden">
      {renderHeader()}
      <Flex direction="column" gap={2} p={2} overflowY="auto" flex={1}>
        {filteredSessions.map((session) => {
          const isActive = currentSessionId === session.id
          // Show more characters for IDs (16 instead of 8)
          const displayName = session.metadata?.whatsappNumber
            ? session.metadata.whatsappNumber
            : `${session.id.substring(0, 16)}...`
          const timeInfo = getTimeAgo(session.updatedAt)
          const channelBadge = session.metadata?.channel
          const lastMessage = session.metadata?.lastMessage

          return (
            <Button
              key={session.id}
              variant="ghost"
              backgroundColor={isActive ? 'green.50' : 'transparent'}
              color={isActive ? 'brand.dark' : 'text.light'}
              aria-label={displayName}
              onClick={() => onSessionClick(session.id)}
              minH="60px"
              h="auto"
              py={3}
              px={3}
              justifyContent="flex-start"
              gap={3}
              width="full"
              position="relative"
              _hover={{
                backgroundColor: isActive ? 'green.50' : 'gray.50',
              }}
            >
              <Avatar
                size="sm"
                bg={isActive ? 'divider.normal' : 'divider.light'}
                color="white"
                fontWeight="semibold"
              />

              <VStack spacing={1} w="full" align="flex-start" overflow="hidden">
                <HStack w="full" spacing={2}>
                  <HStack spacing={1} flex="1" overflow="hidden">
                    <Icon
                      as={channelBadge === 'whatsapp' ? PhoneIcon : GlobeIcon}
                      boxSize={3}
                      color={channelBadge === 'whatsapp' ? 'green.500' : 'blue.500'}
                      flexShrink={0}
                    />
                    <Text
                      color="text.normal"
                      fontWeight="medium"
                      fontSize="sm"
                      noOfLines={1}
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {displayName}
                    </Text>
                  </HStack>
                  <Text color="text.light" fontSize="xs" flexShrink={0}>
                    {timeInfo}
                  </Text>
                </HStack>
                {channelBadge && (
                  <HStack w="full" justifyContent="space-between">
                    <Text
                      display="block"
                      textAlign="start"
                      color="text.light"
                      fontSize="10px"
                      noOfLines={1}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      flex="1"
                      minW={0}
                      maxW={100}
                    >
                      {lastMessage ?? '...'}
                    </Text>
                    <Badge
                      fontSize="10px"
                      colorScheme={channelBadge === 'whatsapp' ? 'green' : 'blue'}
                      variant="subtle"
                    >
                      {channelBadge}
                    </Badge>
                  </HStack>
                )}
              </VStack>
            </Button>
          )
        })}
      </Flex>
    </Flex>
  )
}
