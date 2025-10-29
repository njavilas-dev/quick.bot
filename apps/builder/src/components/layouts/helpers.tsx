import { useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import { SubMenuItem as BaseSubMenuItem, MenuItem } from '@urbiport/ui'

type Badge = {
  text: string
  colorScheme: string
}

export type SubMenuItem = BaseSubMenuItem & {
  badge?: Badge
}
import {
  RobotIcon,
  ToolIcon,
  SpeedIcon,
  NotificationIcon,
  UserTeamIcon,
  CredentialsIcon,
  UserIcon,
  CreditCardIcon,
  PreferencesIcon,
  LockIcon,
  BarChartIcon,
  FileIcon,
  FilterIcon,
  EmailIcon,
  IconComponentType,
} from '@urbiport/icons'
import { env } from '@quickbot.io/env'
import { useChatSessions } from '@/features/inbox/hooks'

// Inbox icon with notification bubble
const InboxNotificationIcon: IconComponentType = (props) => {
  const { color, size, ...boxProps } = props
  return (
    <Box position="relative" display="inline-flex" width="fit-content" height="fit-content">
      <EmailIcon color={color} size={size} {...boxProps} />
      <Box
        position="absolute"
        top="-2px"
        right="-2px"
        width="5px"
        height="5px"
        borderRadius="full"
        bg="green.500"
        boxShadow="0 0 2px rgba(72, 187, 120, 0.8)"
      />
    </Box>
  )
}

const DYNAMIC_ROUTES = ['analytics', 'bots', 'inbox']

const getPathSegments = () => {
  if (typeof window === 'undefined') return []
  return window.location.pathname.split('/').filter(Boolean)
}

const getCurrentMenuPath = (): string => {
  const segments = getPathSegments()
  if (segments.length === 0) return ''

  if (DYNAMIC_ROUTES.includes(segments[0])) {
    return segments[0]
  }

  const cleanPath = segments.length > 2 ? segments.slice(1) : segments
  return cleanPath[0] || ''
}

const getCurrentSubMenuPath = (): string => {
  const segments = getPathSegments()
  if (segments.length < 2) return ''

  if (DYNAMIC_ROUTES.includes(segments[0])) {
    return segments[2] || ''
  }

  const cleanPath = segments.length > 2 ? segments.slice(1) : segments
  return cleanPath[1] || ''
}

const isMenuActive = (menu: string) => {
  return getCurrentMenuPath() === menu
}

const isSubMenuActive = (subMenu: string) => {
  return getCurrentSubMenuPath() === subMenu
}

// Get current botId from URL for analytics routes
const getCurrentBotId = () => {
  if (typeof window === 'undefined') return ''
  const pathSegments = window.location.pathname.split('/').filter(Boolean)
  // For /analytics/[botId]/[page] or /analytics/[botId] patterns
  if (pathSegments[0] === 'analytics' && pathSegments.length >= 2) {
    // /analytics/:botId or /analytics/:botId/flow or /analytics/:botId/answers
    return pathSegments[1]
  }
  return ''
}

const subMenuAccount: SubMenuItem[] = [
  {
    name: 'Profile',
    href: '/account/profile',
    icon: UserIcon,
    isActive: () => isSubMenuActive('profile'),
  },
  {
    name: 'Preferences',
    href: '/account/preferences',
    icon: PreferencesIcon,
    isActive: () => isSubMenuActive('preferences'),
  },
  {
    name: 'Notifications',
    href: '/account/notifications',
    icon: NotificationIcon,
    isActive: () => isSubMenuActive('notifications'),
  },
  ...(env.NEXT_PUBLIC_BETA_ENV
    ? [
        {
          name: 'API Tokens',
          href: '/account/api-tokens',
          icon: CredentialsIcon,
          isActive: () => isSubMenuActive('api-tokens'),
        },
      ]
    : []),
  {
    name: 'Security',
    href: '/account/security',
    icon: LockIcon,
    isActive: () => isSubMenuActive('security'),
  },
]

const getSubMenuWorkspace = (isAdmin: boolean = true): SubMenuItem[] => [
  {
    name: 'Settings',
    href: '/workspace/settings',
    icon: ToolIcon,
    isActive: () => isSubMenuActive('settings'),
    badge: { text: 'Admin', colorScheme: 'purple' },
  },
  {
    name: 'Members',
    href: '/workspace/members',
    icon: UserTeamIcon,
    isActive: () => isSubMenuActive('members'),
    badge: { text: 'Admin', colorScheme: 'purple' },
  },
  {
    name: 'Credentials',
    href: '/workspace/credentials',
    icon: CredentialsIcon,
    isActive: () => isSubMenuActive('credentials'),
    badge: { text: 'Admin', colorScheme: 'purple' },
  },
  ...(isAdmin
    ? [
        {
          name: 'Billing',
          href: '/workspace/billing',
          icon: CreditCardIcon,
          isActive: () => isSubMenuActive('billing'),
          badge: { text: 'Admin', colorScheme: 'purple' },
        },
      ]
    : []),
]

// Dynamic submenu for Bots - only shown on /bots main page, not on /bots/:botId
const getSubMenuBots = (isAdmin: boolean = true): SubMenuItem[] => {
  if (typeof window === 'undefined') return []

  const pathSegments = window.location.pathname.split('/').filter(Boolean)

  // Solo mostrar submenu si estamos exactamente en /bots (1 segmento)
  if (pathSegments.length !== 1 || pathSegments[0] !== 'bots') {
    return []
  }

  return [
    {
      name: 'Settings',
      href: '/workspace/settings',
      icon: ToolIcon,
      isActive: () => isSubMenuActive('settings'),
      badge: { text: 'Admin', colorScheme: 'purple' },
    },
    {
      name: 'Members',
      href: '/workspace/members',
      icon: UserTeamIcon,
      isActive: () => isSubMenuActive('members'),
      badge: { text: 'Admin', colorScheme: 'purple' },
    },
    {
      name: 'Credentials',
      href: '/workspace/credentials',
      icon: CredentialsIcon,
      isActive: () => isSubMenuActive('credentials'),
      badge: { text: 'Admin', colorScheme: 'purple' },
    },
    ...(isAdmin
      ? [
          {
            name: 'Billing',
            href: '/workspace/billing',
            icon: CreditCardIcon,
            isActive: () => isSubMenuActive('billing'),
            badge: { text: 'Admin', colorScheme: 'purple' },
          },
        ]
      : []),
  ]
}

// Dynamic submenu that updates based on current botId
const getSubMenuAnalytics = (): SubMenuItem[] => {
  const botId = getCurrentBotId()

  return [
    {
      name: 'Analytics',
      href: botId ? `/analytics/${botId}` : '/analytics',
      icon: BarChartIcon,
      isActive: () => {
        const pathSegments = window?.location?.pathname.split('/').filter(Boolean) || []
        // Active when on /analytics/:botId (exactly 2 segments)
        return pathSegments[0] === 'analytics' && pathSegments.length === 2
      },
    },
    {
      name: 'Flow',
      href: botId ? `/analytics/${botId}/flow` : '/analytics',
      icon: FilterIcon,
      isActive: () => {
        const pathSegments = window?.location?.pathname.split('/').filter(Boolean) || []
        // Active when on /analytics/:botId/flow
        return pathSegments[0] === 'analytics' && pathSegments[2] === 'flow'
      },
    },
    {
      name: 'Answers',
      href: botId ? `/analytics/${botId}/answers` : '/analytics',
      icon: FileIcon,
      isActive: () => {
        const pathSegments = window?.location?.pathname.split('/').filter(Boolean) || []
        // Active when on /analytics/:botId/answers
        return pathSegments[0] === 'analytics' && pathSegments[2] === 'logs'
      },
    },
  ]
}

// Get current botId from URL for inbox routes
const getCurrentInboxBotId = () => {
  if (typeof window === 'undefined') return ''
  const pathSegments = window.location.pathname.split('/').filter(Boolean)
  if (pathSegments[0] === 'inbox' && pathSegments.length >= 2) {
    return pathSegments[1]
  }
  return ''
}

// Get current chatSessionId from URL for inbox routes
const getCurrentChatSessionId = () => {
  if (typeof window === 'undefined') return ''
  const pathSegments = window.location.pathname.split('/').filter(Boolean)
  if (pathSegments[0] === 'inbox' && pathSegments.length >= 3) {
    return pathSegments[2]
  }
  return ''
}

// Hook to get inbox submenu with real chat sessions
const useSubMenuInbox = (): SubMenuItem[] => {
  const botId = getCurrentInboxBotId()

  // Fetch real sessions using the hook
  const { sessions, isLoading } = useChatSessions({
    botId,
    limit: 50, // Show up to 50 sessions in the menu
    enabled: !!botId, // Only fetch if we have a botId
  })

  return useMemo(() => {
    // If there's no botId, don't show sessions
    if (!botId) return []

    // If loading, show a loading indicator
    if (isLoading) {
      return [
        {
          name: 'Loading sessions...',
          href: `/inbox/${botId}`,
          icon: EmailIcon,
          isActive: () => false,
        },
      ]
    }

    // If there are no sessions, show a message
    if (!sessions || sessions.length === 0) {
      return [
        {
          name: 'No chat sessions',
          href: `/inbox/${botId}`,
          icon: EmailIcon,
          isActive: () => false,
        },
      ]
    }

    // Map the actual sessions
    return sessions.map((session) => {
      // Format time ago for updatedAt
      const getTimeAgo = (date: Date) => {
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

      // Build display name with whatsapp number or session ID
      const displayName = session.metadata?.whatsappNumber
        ? session.metadata.whatsappNumber
        : `Session ${session.id.substring(0, 8)}...`

      // Build secondary info with time
      const timeInfo = getTimeAgo(session.updatedAt)

      return {
        name: displayName,
        description: timeInfo, // This will show as secondary text if supported by VerticalMenu
        href: `/inbox/${botId}/${session.id}`,
        icon: EmailIcon,
        isActive: () => getCurrentChatSessionId() === session.id,
        badge: session.metadata?.channel
          ? {
              text: session.metadata.channel === 'whatsapp' ? 'WA' : 'Web',
              colorScheme: session.metadata.channel === 'whatsapp' ? 'green' : 'blue',
            }
          : undefined,
      }
    })
  }, [botId, sessions, isLoading])
}

// Hook version that can use other hooks
export const useMenuSections = (isAdmin: boolean = true): MenuItem[] => {
  const inboxSubMenu = useSubMenuInbox()

  return useMemo(
    () => [
      {
        name: 'Dashboard',
        path: 'dashboard',
        href: '/dashboard',
        location: 'up',
        icon: SpeedIcon,
        subMenu: [],
        isActive: () => isMenuActive('dashboard'),
      },
      {
        name: 'Account',
        path: 'account',
        href: '/account/profile',
        location: 'up',
        icon: UserIcon,
        subMenu: subMenuAccount,
        isActive: () =>
          isSubMenuActive('profile') ||
          isSubMenuActive('preferences') ||
          isSubMenuActive('notifications') ||
          isSubMenuActive('api-tokens') ||
          isSubMenuActive('security'),
      },
      {
        name: 'Workspace',
        path: 'workspace',
        href: '/workspace/settings',
        location: 'up',
        icon: ToolIcon,
        subMenu: getSubMenuWorkspace(isAdmin),
        isActive: () => isSubMenuActive('workspace'),
      },
      {
        name: 'Bots',
        path: 'bots',
        href: '/bots',
        location: 'up',
        icon: RobotIcon,
        subMenu: getSubMenuBots(isAdmin),
        isActive: () => {
          const pathSegments = window?.location?.pathname.split('/').filter(Boolean) || []
          // Active when on /bots route (with or without botId)
          return pathSegments[0] === 'bots'
        },
      },
      {
        name: 'Inbox',
        path: 'inbox',
        href: '/inbox',
        location: 'up',
        icon: InboxNotificationIcon,
        subMenu: [], // Use custom InboxSidebar component instead
        isActive: () => {
          const pathSegments = window?.location?.pathname.split('/').filter(Boolean) || []
          return pathSegments[0] === 'inbox'
        },
      },
      {
        name: 'Analytics',
        path: 'analytics',
        href: '/analytics',
        location: 'up',
        icon: BarChartIcon,
        subMenu: getSubMenuAnalytics(),
        isActive: () => {
          const pathSegments = window?.location?.pathname.split('/').filter(Boolean) || []
          // Active when on any analytics route: /analytics, /analytics/:botId, /analytics/:botId/flow, /analytics/:botId/answers
          return pathSegments[0] === 'analytics'
        },
      },
    ],
    [isAdmin, inboxSubMenu],
  )
}

// Legacy export for backward compatibility (static version without inbox sessions)
export const getMenuSections = (isAdmin: boolean = true): MenuItem[] => [
  {
    name: 'Dashboard',
    path: 'dashboard',
    href: '/dashboard',
    location: 'up',
    icon: SpeedIcon,
    subMenu: [],
    isActive: () => isMenuActive('dashboard'),
  },
  {
    name: 'Account',
    path: 'account',
    href: '/account/profile',
    location: 'up',
    icon: UserIcon,
    subMenu: subMenuAccount,
    isActive: () =>
      isSubMenuActive('profile') ||
      isSubMenuActive('preferences') ||
      isSubMenuActive('notifications') ||
      isSubMenuActive('api-tokens') ||
      isSubMenuActive('security'),
  },
  {
    name: 'Workspace',
    path: 'workspace',
    href: '/workspace/settings',
    location: 'up',
    icon: ToolIcon,
    subMenu: getSubMenuWorkspace(isAdmin),
    isActive: () => isSubMenuActive('workspace'),
  },
  {
    name: 'Bots',
    path: 'bots',
    href: '/bots',
    location: 'up',
    icon: RobotIcon,
    subMenu: getSubMenuBots(isAdmin),
    isActive: () => {
      const pathSegments = window?.location?.pathname.split('/').filter(Boolean) || []
      return pathSegments[0] === 'bots'
    },
  },
  {
    name: 'Inbox',
    path: 'inbox',
    href: '/inbox',
    location: 'up',
    icon: InboxNotificationIcon,
    subMenu: [],
    isActive: () => {
      const pathSegments = window?.location?.pathname.split('/').filter(Boolean) || []
      return pathSegments[0] === 'inbox'
    },
  },
  {
    name: 'Analytics',
    path: 'analytics',
    href: '/analytics',
    location: 'up',
    icon: BarChartIcon,
    subMenu: getSubMenuAnalytics(),
    isActive: () => {
      const pathSegments = window?.location?.pathname.split('/').filter(Boolean) || []
      return pathSegments[0] === 'analytics'
    },
  },
]

export const menuSections = getMenuSections()
