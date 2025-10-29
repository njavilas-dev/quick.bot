import React, { useState, useEffect, useCallback } from 'react'
import { HStack, MenuItem, Text } from '@chakra-ui/react'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu, useToast } from '@urbiport/ui'
import { useWorkspace } from '@/hooks/useWorkspace'
import { BotIcon } from '@/components/BotIcon'
import { useBots } from '@/hooks/useBots'
import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/router'

export const BotsDropdown = () => {
  const router = useRouter()
  const { t } = useTranslate()
  const { showToast } = useToast()
  const { workspace } = useWorkspace()
  const [displayName, setDisplayName] = useState<string | undefined>(undefined)

  // Get current botId from path params
  const selectedBotId = typeof router.query.botId === 'string' ? router.query.botId : undefined

  const onBotChange = useCallback((botId: string) => {
    // Replace the current botId in the URL with the new one
    const currentPath = router.asPath

    let newPath: string
    if (selectedBotId) {
      // If there's already a botId, replace it
      newPath = currentPath.replace(selectedBotId, botId)
    } else if (router.pathname.includes('[botId]')) {
      // If the route has [botId] param, replace it
      newPath = `${router.pathname.replace('[botId]', botId)}${router.asPath.includes('?') ? router.asPath.substring(router.asPath.indexOf('?')) : ''}`
    } else {
      // If the route doesn't have [botId] param (e.g., /analytics), append it
      const basePath = router.pathname
      const queryString = router.asPath.includes('?') ? router.asPath.substring(router.asPath.indexOf('?')) : ''
      newPath = `${basePath}/${botId}${queryString}`
    }

    router.push(newPath)
  }, [router, selectedBotId])

  const { bots, isLoading } = useBots({
    workspaceId: workspace?.id ?? '',
    folderId: 'root',
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
        status: 'error',
      })
    },
  })

  // Auto-select first bot if none is selected
  useEffect(() => {
    if (!isLoading && bots && bots.length > 0 && !selectedBotId) {
      onBotChange(bots[0].id)
      setDisplayName(bots[0].name)
    }
  }, [bots, isLoading, selectedBotId, onBotChange])

  // Update display name when selected bot changes
  useEffect(() => {
    if (bots && selectedBotId) {
      const selectedBot = bots.find((bot) => bot.id === selectedBotId)
      if (selectedBot) {
        setDisplayName(selectedBot.name)
      }
    }
  }, [selectedBotId, bots])

  const handleBotChange = (botId: string) => {
    const selectedBot = bots?.find((bot) => bot.id === botId)
    if (selectedBot) {
      setDisplayName(selectedBot.name)
    }
    if (onBotChange) {
      onBotChange(botId)
    }
  }

  let menuButtonContent: React.ReactNode

  if (displayName) {
    menuButtonContent = displayName
  } else if (!isLoading && bots && bots.length > 0) {
    menuButtonContent = bots[0].name
  } else if (!isLoading && (!bots || bots.length === 0)) {
    menuButtonContent = 'No bots...'
  }

  return (
    <DropdownMenu
      placement="bottom-start"
      matchWidth={false}
      menuButton={menuButtonContent}
      menuButtonProps={{
        'aria-label': 'Switch Bot',
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
      {bots?.map((bot) => (
        <MenuItem
          key={bot.id}
          onClick={() => handleBotChange(bot.id)}
          aria-selected={selectedBotId === bot.id ? 'true' : 'false'}
        >
          <HStack w="100%">
            <BotIcon icon={bot.icon} size="16px" />
            <Text>{bot.name}</Text>
          </HStack>
        </MenuItem>
      ))}
    </DropdownMenu>
  )
}
