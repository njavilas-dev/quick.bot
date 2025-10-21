import { HStack, IconButton } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@urbiport/icons'
import { useToast } from '@urbiport/ui'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Select, InputText, FormControl } from '@urbiport/ui'
import { BotIcon } from '@/components/BotIcon'
import { useBots } from '@/hooks/useBots'
import { useTranslate } from '@tolgee/react'

type Props = {
  idsToExclude: string[]
  botId?: string | 'current'
  currentWorkspaceId: string
  onSelect: (botId: string | 'current' | undefined) => void
}

export const BotsDropdown = ({ idsToExclude, botId, onSelect, currentWorkspaceId }: Props) => {
  const { t } = useTranslate()
  const { query } = useRouter()
  const { showToast } = useToast()
  const { bots, isLoading } = useBots({
    workspaceId: currentWorkspaceId,
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        title: error.name,
        description: error.message,
      })
    },
  })

  if (isLoading) {
    return <InputText defaultValue="Loading..." isDisabled />
  }
  if (!bots || bots.length === 0) {
    return <InputText defaultValue="No bots found" isDisabled />
  }
  return (
    <FormControl>
      <HStack>
        <Select
          selectedItem={botId}
          items={[
            {
              label: 'Current bot',
              value: 'current',
            },
            ...(bots ?? [])
              .filter((bot) => !idsToExclude.includes(bot.id))
              .map((bot) => ({
                icon: <BotIcon icon={bot.icon} size="sm" />,
                label: bot.name,
                value: bot.id,
              })),
          ]}
          onSelect={onSelect}
          placeholder={'Select a bot'}
        />
        {botId && botId !== 'current' && (
          <IconButton
            variant="outline"
            aria-label="Navigate to bot"
            icon={<ExternalLinkIcon />}
            as={Link}
            href={{
              pathname: '/bots/[botId]/flow',
              query: {
                botId: botId,
                parentId: query.parentId
                  ? Array.isArray(query.parentId)
                    ? query.parentId.concat(query.botId?.toString() ?? '')
                    : [query.parentId, query.botId?.toString() ?? '']
                  : query.botId ?? [],
              },
            }}
          />
        )}
      </HStack>
    </FormControl>
  )
}
