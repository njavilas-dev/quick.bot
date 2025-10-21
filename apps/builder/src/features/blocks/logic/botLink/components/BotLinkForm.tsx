import { Stack } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { GroupsDropdown } from './GroupsDropdown'
import { BotsDropdown } from './BotsDropdown'
import { trpc } from '@/lib/trpc'
import { isNotEmpty } from '@quickbot.io/lib'
import { FormControl, Switch } from '@urbiport/ui'
import { BotLinkBlock } from '@quickbot.io/schemas'
import { defaultBotLinkOptions } from '@quickbot.io/schemas/features/blocks/logic/botLink/constants'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: BotLinkBlock['options']
  onOptionsChange: (options: BotLinkBlock['options']) => void
}

export const BotLinkForm = ({ options, onOptionsChange }: Props) => {
  const { bot } = useBot()
  const { t } = useTranslate()

  const handleBotIdChange = async (botId: string | 'current' | undefined) =>
    onOptionsChange({ ...options, botId, groupId: undefined })

  const { data: linkedBotData } = trpc.bot.getBot.useQuery(
    {
      botId: options?.botId as string,
    },
    {
      enabled: isNotEmpty(options?.botId) && options?.botId !== 'current',
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const handleGroupIdChange = (groupId: string | undefined) =>
    onOptionsChange({ ...options, groupId })

  const updateMergeResults = (mergeResults: boolean) =>
    onOptionsChange({ ...options, mergeResults })

  const isCurrentBotSelected = (bot && options?.botId === bot.id) || options?.botId === 'current'

  return (
    <Stack spacing={6}>
      {bot && (
        <BotsDropdown
          idsToExclude={[bot.id]}
          botId={options?.botId}
          onSelect={handleBotIdChange}
          currentWorkspaceId={bot.workspaceId as string}
        />
      )}
      {options?.botId && (
        <GroupsDropdown
          key={options.botId}
          groups={bot && isCurrentBotSelected ? bot.groups : linkedBotData?.bot?.groups ?? []}
          groupId={options.groupId}
          onGroupIdSelected={handleGroupIdChange}
          isLoading={
            linkedBotData?.bot === undefined &&
            options.botId !== 'current' &&
            bot &&
            bot.id !== options.botId
          }
        />
      )}
      {!isCurrentBotSelected && (
        <FormControl
          direction="row"
          label={t('blocks.logic.botLink.mergeAnswers.label')}
          moreInfoTooltip={t('blocks.logic.botLink.mergeAnswers.tooltip')}
        >
          <Switch
            defaultValue={options?.mergeResults ?? defaultBotLinkOptions.mergeResults}
            onChange={updateMergeResults}
          />
        </FormControl>
      )}
    </Stack>
  )
}
