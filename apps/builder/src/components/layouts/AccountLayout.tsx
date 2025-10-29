import { useRouter } from 'next/router'
import { useEffect, type ReactNode } from 'react'
import { Box, Button, Flex } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { useToast, VerticalMenu, Search, SearchItem } from '@urbiport/ui'
import { RobotIcon } from '@urbiport/icons'
import { toTitleCase } from '@quickbot.io/lib'
import { BillingPlanType } from '@quickbot.io/prisma'
import { useUser } from '@/hooks/useUser'
import { useHydration } from '@/hooks/useHydration'
import { useWorkspaceRole } from '@/hooks/useWorkspaceRole'
import UpgradePlan from '@/features/billing/components/UpgradePlan'
import { HeaderMenu } from '../HeaderMenu'
import { useMenuSections } from './helpers'
import { InboxSidebar } from '@/features/inbox/components/InboxSidebar'
import { DefaultLayout } from './DefaultLayout'

const searchItems: SearchItem[] = [
  {
    id: 1,
    category: 'settings',
    menuItems: [
      { icon: RobotIcon, text: 'Account Settings', path: '/account/profile' },
      { icon: RobotIcon, text: 'Workspace Settings', path: '/workspace/settings' },
    ],
  },
  {
    id: 2,
    category: 'bots',
    menuItems: [{ icon: RobotIcon, text: 'Bot', path: '/bots' }],
  },
]

const AccountLayoutContent = ({ children }: { children: ReactNode }) => {
  const { showToast } = useToast()
  const { t } = useTranslate()
  const { user, updateUser } = useUser()
  const { isAdmin } = useWorkspaceRole()
  const isHydrated = useHydration()
  const router = useRouter()

  // Use the hook to get menu sections with live chat sessions
  const menuSections = useMenuSections(isAdmin)

  useEffect(() => {
    const newPlan = router.query.stripe?.toString()
    if (newPlan === BillingPlanType.PERSONAL || newPlan === BillingPlanType.BUSINESS)
      showToast({
        status: 'success',
        title: 'Upgrade success!',
        description: `Workspace upgraded to ${toTitleCase(newPlan)} 🎉`,
      })
  }, [router.query.stripe, showToast])

  if (!isHydrated) return null

  const changeAppearance = async (value: string) => {
    updateUser({ preferredAppAppearance: value })
  }

  const redirect = (href: string) => {
    router.push(href)
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const supportBotId = process.env.NEXT_PUBLIC_SUPPORT_BOT

  // Check if we're on an inbox route
  const pathSegments = router.pathname.split('/').filter(Boolean)
  const isInboxRoute = pathSegments[0] === 'inbox'

  const upgradeButton = (
    <UpgradePlan
      trigger={({ onOpen }) => (
        <Button onClick={onOpen} colorScheme="teal" w="full" variant="solid">
          {t('upgrade').toUpperCase()}
        </Button>
      )}
    />
  )

  return (
    <Flex direction="row" h="100vh" bgColor="bg.dark" overflow="hidden" position="relative">
      <VerticalMenu
        supportBotId={supportBotId}
        defaultAppearance={user?.preferredAppAppearance ?? 'system'}
        onChangeAppearance={changeAppearance}
        menuSections={menuSections}
        redirect={redirect}
        searchComponent={<Search searchItems={searchItems} onClick={handleNavigate} />}
        upgradeButton={upgradeButton}
      />

      {isInboxRoute && <InboxSidebar upgradeButton={upgradeButton} />}

      <Flex direction="column" flex="1" overflow="hidden" gap="6" m="0" pt="3" pb="6">
        <Box mx="6">
          <HeaderMenu />
        </Box>
        <Box mx="6" flex="1" overflowY="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}

export const AccountLayout = ({ children }: { children: ReactNode }) => {
  return (
    <DefaultLayout>
      <AccountLayoutContent>{children}</AccountLayoutContent>
    </DefaultLayout>
  )
}
