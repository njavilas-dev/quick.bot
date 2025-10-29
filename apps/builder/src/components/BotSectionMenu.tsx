import React from 'react'
import { MenuItem, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu } from '@urbiport/ui'
import { useWorkspace } from '@/hooks/useWorkspace'

export const BotSectionMenu = () => {
  const router = useRouter()
  const { workspace } = useWorkspace()

  // Check if we're in analytics, bots, or inbox section
  const isAnalyticsPage = router.pathname.startsWith('/analytics')
  const isBotPage = router.pathname.startsWith('/bots')
  const isInboxPage = router.pathname.startsWith('/inbox')

  const botId = typeof router.query.botId === 'string' ? router.query.botId : undefined

  const currentSection = isAnalyticsPage ? 'Analytics' : isInboxPage ? 'Inbox' : 'Editor'

  const handleSectionChange = (section: 'bots' | 'analytics' | 'inbox') => {
    if (!botId) return

    if (section === 'analytics') {
      router.push(`/analytics/${botId}`)
    } else if (section === 'inbox') {
      router.push(`/inbox/${botId}`)
    } else {
      router.push(`/bots/${botId}/flow`)
    }
  }

  const isLoading = !botId

  return (
    <DropdownMenu
      placement="bottom-start"
      matchWidth={false}
      menuButton={currentSection}
      menuButtonProps={{
        'aria-label': 'Select Section',
        isLoading,
        rightIcon: <ChevronDownIcon />,
        variant: 'unstyled',
        bg: 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        maxWidth: '260px',
        sx: {
          '& > span:first-of-type': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: '1',
            minWidth: '0',
          }
        }
      }}
    >
      <MenuItem
        onClick={() => handleSectionChange('bots')}
        aria-selected={isBotPage ? 'true' : 'false'}
      >
        <Text>Editor</Text>
      </MenuItem>
      <MenuItem
        onClick={() => handleSectionChange('inbox')}
        aria-selected={isInboxPage ? 'true' : 'false'}
      >
        <Text>Inbox</Text>
      </MenuItem>
      <MenuItem
        onClick={() => handleSectionChange('analytics')}
        aria-selected={isAnalyticsPage ? 'true' : 'false'}
        isDisabled={!workspace?.billingPlan?.allowAnalytics}
      >
        <Text>Analytics</Text>
      </MenuItem>
    </DropdownMenu>
  )
}