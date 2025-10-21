import React, { useState, useEffect } from 'react'
import { HStack, MenuItem, Text, Spinner } from '@chakra-ui/react'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu, useToast } from '@urbiport/ui'
import { useWorkspace } from '@/hooks/useWorkspace'
import { BotIcon } from '@/components/BotIcon'
import { useBots } from '@/hooks/useBots'
import { useTranslate } from '@tolgee/react'

interface BotsDropdownProps {
  selectedBotId?: string
  onBotChange?: (botId: string) => void
}

export const BotsDropdown: React.FC<BotsDropdownProps> = ({
  selectedBotId,
  onBotChange,
}) => {
  const { t } = useTranslate()
  const { showToast } = useToast()
  const { workspace } = useWorkspace()
  const [displayName, setDisplayName] = useState<string | undefined>(undefined)

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
    if (!isLoading && bots && bots.length > 0 && !selectedBotId && onBotChange) {
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
    menuButtonContent = 'No bots'
  } else {
    menuButtonContent = <Spinner size="sm" />
  }

  return (
    <DropdownMenu
      placement="bottom-start"
      matchWidth={false}
      menuButton={menuButtonContent}
      menuButtonProps={{
        'aria-label': 'Select Bot',
        isLoading: isLoading,
        rightIcon: <ChevronDownIcon />,
        variant: 'unstyled',
        bg: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        size: 'sm',
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
