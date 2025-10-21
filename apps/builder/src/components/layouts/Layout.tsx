import { useRouter } from 'next/router'
import { useEffect, useMemo, type ReactNode } from 'react'
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
import { getMenuSections } from './helpers'

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

export type LayoutProps = {
  children: ReactNode
  hideWorkspaceDropdown?: boolean
}

const Layout = ({ children, hideWorkspaceDropdown }: LayoutProps) => {
  const { showToast } = useToast()
  const { t } = useTranslate()
  const { user, updateUser } = useUser()
  const { isAdmin } = useWorkspaceRole()
  const isHydrated = useHydration()
  const router = useRouter()

  // Recalculate menu sections when pathname changes (for dynamic analytics routes)
  const menuSections = useMemo(() => getMenuSections(isAdmin), [router.pathname, isAdmin])

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

  return (
    <Flex direction="row" h="100vh" bgColor="bg.dark" overflow="hidden" position="relative">
      <VerticalMenu
        supportBotId={supportBotId}
        defaultAppearance={user?.preferredAppAppearance ?? 'system'}
        onChangeAppearance={changeAppearance}
        menuSections={menuSections}
        redirect={redirect}
        searchComponent={<Search searchItems={searchItems} onClick={handleNavigate} />}
        upgradeButton={
          <UpgradePlan
            trigger={({ onOpen }) => (
              <Button onClick={onOpen} colorScheme="teal" w="full" variant="solid">
                {t('upgrade').toUpperCase()}
              </Button>
            )}
          />
        }
      />
      <Flex direction="column" flex="1" overflow="hidden" gap="6" m="0" pt="3" pb="6">
        <Box mx="6">
          <HeaderMenu hideWorkspaceDropdown={hideWorkspaceDropdown} />
        </Box>
        <Box mx="6" flex="1" overflowY="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}

export default Layout
