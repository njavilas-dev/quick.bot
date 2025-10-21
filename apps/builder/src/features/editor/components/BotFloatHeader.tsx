import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Flex,
  HStack,
  Button,
  IconButton,
  Spinner,
  Text,
  ButtonGroup,
  Divider,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@urbiport/icons'

import { HORIZONTAL_MENU_HEIGHT, SIDEBAR_WIDTH } from '@/features/editor/constants'
import { useBot } from '../providers/BotProvider'
import { useTranslate } from '@tolgee/react'
import { useSidebarSlide } from '@urbiport/ui'
import { AccountDropdown } from '@/features/account/components/AccountDropdown'
import { useUser } from '@/hooks/useUser'
import { EditableBotName } from '@/components/EditableBotName'
import { EditableBotIcon } from '@/components/EditableBotIcon'
import { BotIcon } from '@/components/BotIcon'
import { LogoIcon } from '@urbiport/icons'
import { env } from '@quickbot.io/env'

export const BotFloatHeader = () => {
  const { t } = useTranslate()
  const { user } = useUser()
  const { bot, currentUserMode, updateBot, isSavingLoading, isPublished } = useBot()

  const { isExtended } = useSidebarSlide()
  const router = useRouter()

  const isGuest = currentUserMode === 'guest'

  const handleSubmitName = (name: string) => updateBot({ updates: { name } })

  const handleChangeIcon = (icon: string) => updateBot({ updates: { icon } })

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
      h={`${HORIZONTAL_MENU_HEIGHT}px`}
      zIndex={2}
      pos="absolute"
      right={0}
      left="auto"
      flexShrink={0}
      justifyContent="space-between"
      px={3}
    >
      <HStack justify="center" align="center" spacing="6">
        {!isGuest && (
          <IconButton
            as={Link}
            aria-label="Navigate back"
            icon={<ChevronLeftIcon fontSize="xl" />}
            variant="link"
            href={{
              pathname: router.query.parentId
                ? '/bots/[botId]/flow'
                : bot?.folderId
                  ? '/bots/folders/[id]'
                  : '/bots',
              query: {
                id: bot?.folderId ?? [],
                parentId: Array.isArray(router.query.parentId)
                  ? router.query.parentId.slice(0, -1)
                  : [],
                botId: Array.isArray(router.query.parentId)
                  ? [...router.query.parentId].pop()
                  : router.query.parentId ?? [],
              },
            }}
          />
        )}
        {bot &&
          (isGuest ? (
            <>
              {env.NEXT_PUBLIC_BETA_ENV && (
                <BotIcon icon={bot.icon} size="24px" />
              )}
              <Text noOfLines={2} maxW="150px" overflow="hidden" minW="30px" minH="20px">
                {bot?.name}
              </Text>
            </>
          ) : (
            <>
              {env.NEXT_PUBLIC_BETA_ENV && (
                <EditableBotIcon
                  icon={bot.icon}
                  size="26px"
                  uploadFileProps={{
                    workspaceId: bot.workspaceId,
                    botId: bot.id,
                    fileName: 'icon',
                    blockId: bot.id,
                  }}
                  onChange={handleChangeIcon}
                />
              )}
              <EditableBotName
                key={bot?.name}
                defaultName={bot?.name ?? ''}
                onNewName={handleSubmitName}
              />
            </>
          ))}

        {isSavingLoading && (
          <HStack>
            <Spinner size="sm" />
            <Text fontSize="sm" color="text.light">
              {t('editor.header.savingSpinner.label')}
            </Text>
          </HStack>
        )}
      </HStack>
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
