import { useRouter } from 'next/router'
import { type ReactNode } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { VerticalMenu } from '@urbiport/ui'
import { useUser } from '@/hooks/useUser'
import { useHydration } from '@/hooks/useHydration'
import { useWorkspaceRole } from '@/hooks/useWorkspaceRole'
import { useMenuSections } from './helpers'
import { DefaultLayout } from './DefaultLayout'

const BotLayoutContent = ({ children }: { children: ReactNode }) => {
  const { user, updateUser } = useUser()
  const { isAdmin } = useWorkspaceRole()
  const isHydrated = useHydration()
  const router = useRouter()

  // Use the hook to get menu sections with live chat sessions
  const menuSections = useMenuSections(isAdmin)

  if (!isHydrated) return null

  const defaultAppearance =
    user?.preferredAppAppearance && user.preferredAppAppearance !== 'system'
      ? user.preferredAppAppearance
      : 'light'

  const changeAppearance = async (value: string) => {
    updateUser({ preferredAppAppearance: value })
  }

  const redirect = (href: string) => {
    router.push(href)
  }

  const supportBotId = process.env.NEXT_PUBLIC_SUPPORT_BOT

  return (
    <Flex direction="row" h="100vh" bgColor="bg.dark" overflow="hidden" position="relative">
      <VerticalMenu
        supportBotId={supportBotId}
        defaultAppearance={defaultAppearance}
        onChangeAppearance={changeAppearance}
        menuSections={menuSections}
        redirect={redirect}
      />
      <Box w="full" overflow="hidden">
        {children}
      </Box>
    </Flex>
  )
}

export const BotLayout = ({ children }: { children: ReactNode }) => {
  return (
    <DefaultLayout>
      <BotLayoutContent>{children}</BotLayoutContent>
    </DefaultLayout>
  )
}
