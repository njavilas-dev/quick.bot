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
} from '@urbiport/icons'
import { env } from '@quickbot.io/env'

const DYNAMIC_ROUTES = ['analytics', 'bots']

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
  ...(env.NEXT_PUBLIC_BETA_ENV ? [{
    name: 'API Tokens',
    href: '/account/api-tokens',
    icon: CredentialsIcon,
    isActive: () => isSubMenuActive('api-tokens'),
  }] : []),
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
  ...(isAdmin ? [{
    name: 'Billing',
    href: '/workspace/billing',
    icon: CreditCardIcon,
    isActive: () => isSubMenuActive('billing'),
    badge: { text: 'Admin', colorScheme: 'purple' },
  }] : []),
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
    ...(isAdmin ? [{
      name: 'Billing',
      href: '/workspace/billing',
      icon: CreditCardIcon,
      isActive: () => isSubMenuActive('billing'),
      badge: { text: 'Admin', colorScheme: 'purple' },
    }] : []),
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
      // Active when on /bots route (with or without botId)
      return pathSegments[0] === 'bots'
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
]

export const menuSections = getMenuSections()
