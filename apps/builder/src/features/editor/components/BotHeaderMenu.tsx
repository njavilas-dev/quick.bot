import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Flex,
  HStack,
  Button,
  ButtonGroup,
  Divider,
  Text,
} from '@chakra-ui/react'

import { SIDEBAR_WIDTH } from '@/features/editor/constants'
import { useBot } from '../providers/BotProvider'
import { useTranslate } from '@tolgee/react'
import { useSidebarSlide } from '@urbiport/ui'
import { AccountDropdown } from '@/features/account/components/AccountDropdown'
import { useUser } from '@/hooks/useUser'
import { LogoIcon } from '@urbiport/icons'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const BotHeaderMenu = () => {
  const { t } = useTranslate()
  const { user } = useUser()
  const { bot, currentUserMode, isPublished } = useBot()

  const { isExtended } = useSidebarSlide()
  const router = useRouter()

  const isGuest = currentUserMode === 'guest'

  const routes = [
    {
      path: '/flow',
      label: t('editor.header.flowButton.label'),
      href: `/bots/${bot?.id}/flow`,
      disabled: false,
    },
    {
      path: 'settings',
      label: t('editor.header.settingsButton.label'),
      href: `/bots/${bot?.id}/settings`,
      disabled: false,
    },
    {
      path: 'theme',
      label: t('editor.header.themeButton.label'),
      href: `/bots/${bot?.id}/theme`,
      disabled: false,
    },
    !isGuest
      ? {
        path: 'deploy',
        label: t('deploy.button.label'),
        href: `/bots/${bot?.id}/deploy`,
        disabled: !isPublished,
      }
      : null,
  ]

  return (
    <Flex
      w={`calc(100% - ${isExtended ? SIDEBAR_WIDTH : 0}px)`}
      transition="width 350ms cubic-bezier(0.075, 0.82, 0.165, 1) 0s"
      justify="center"
      align="center"
      zIndex={2}
      pos="absolute"
      right={0}
      left="auto"
      flexShrink={0}
      justifyContent="space-between"
      px={6}
      pt={3}
    >
      {bot &&
        (isGuest ? (
          <Text noOfLines={2} maxW="150px" overflow="hidden" minW="30px" minH="20px">
            {bot?.name}
          </Text>
        ) : (
          <Breadcrumbs />
        ))}
      <ButtonGroup
        variant="outline"
        isAttached={true}
        borderRadius="md"
        size="md"
        bg="bg.normal"
        border="1px solid"
        borderColor="divider.light"
      >
        {routes.map((route) => {
          if (!route) return null
          const isActive = router.pathname.includes(route.path)
          return (
            <Button
              key={route.path}
              as={Link}
              href={route.disabled ? router.asPath : route.href}
              variant="ghost"
              isDisabled={route.disabled}
              textTransform="uppercase"
              color="text.light"
              fontWeight="600"
              fontSize="13"
              borderBottom={isActive ? '2px solid' : 'none'}
              borderColor="brand.primary"
              _hover={{
                backgroundColor: 'bg.hover',
              }}
            >
              {route.label}
            </Button>
          )
        })}
      </ButtonGroup>
      <HStack spacing={4}>
        {!isGuest ? (
          <>
            <Link href="/workspace/billing">
              <Button colorScheme="teal" variant="solid">
                {t('upgrade').toUpperCase()}
              </Button>
            </Link>
            <AccountDropdown />
          </>
        ) : (
          <>
            {!user && (
              <>
                <Divider orientation="vertical" h="25px" />
                <Button
                  as={Link}
                  href="/signup"
                  leftIcon={<LogoIcon width="5" height="5" />}
                  variant="outline"
                >
                  {t('editor.header.tryQuickBotButton.label')}
                </Button>
              </>
            )}
          </>
        )}
      </HStack>
    </Flex>
  )
}
