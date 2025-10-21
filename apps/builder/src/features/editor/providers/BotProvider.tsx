import { PublicBot, PublicBotV6, BotV6, botV6Schema } from '@quickbot.io/schemas'
import { Router } from 'next/router'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isDefined, omit } from '@quickbot.io/lib'
import { edgesAction, EdgesActions } from './botActions/edges'
import { itemsAction, ItemsActions } from './botActions/items'
import { GroupsActions, groupsActions } from './botActions/groups'
import { blocksAction, BlocksActions } from './botActions/blocks'
import { variablesAction, VariablesActions } from './botActions/variables'
import { dequal } from 'dequal'
import { useToast } from '@urbiport/ui'
import { useUndo } from '../hooks/useUndo'
import { useAutoSave } from '@/hooks/useAutoSave'
import { preventUserFromRefreshing } from '@/helpers/preventUserFromRefreshing'
import { areBotsEqual } from '@/features/publish/helpers/areBotsEqual'
import { isPublished as isPublishedHelper } from '@/features/publish/helpers/isPublished'
import { convertPublicBotToBot } from '@/features/publish/helpers/convertPublicBotToBot'
import { trpc } from '@/lib/trpc'
import { EventsActions, eventsActions } from './botActions/events'
import { useGraphGroups } from '@/features/graph/hooks/useGraphGroups'
import { useTranslate } from '@tolgee/react'
import { useLoadingSave } from '@/hooks/useLoadingSave'

const autoSaveTimeout = 15000

type UpdateBotPayload = Partial<
  Pick<
    BotV6,
    | 'theme'
    | 'selectedThemeTemplateId'
    | 'settings'
    | 'publicId'
    | 'name'
    | 'icon'
    | 'customDomain'
    | 'resultsTablePreferences'
    | 'isClosed'
    | 'whatsAppCredentialsId'
    | 'riskLevel'
  >
>

export type SetBot = (newPresent: BotV6 | ((current: BotV6) => BotV6)) => void

const botContext = createContext<
  {
    bot?: BotV6
    publishedBot?: PublicBotV6
    publishedBotVersion?: PublicBot['version']
    currentUserMode: 'guest' | 'read' | 'write'
    is404: boolean
    isPublished: boolean
    isModified: boolean
    isSavingLoading: boolean
    save: (updates?: Partial<BotV6>, overwrite?: boolean) => Promise<void>
    undo: () => void
    redo: () => void
    canRedo: boolean
    canUndo: boolean
    updateBot: (props: {
      updates: UpdateBotPayload
      save?: boolean
      overwrite?: boolean
    }) => Promise<BotV6 | undefined>
    restorePublishedBot: () => Promise<void>
    refetchBot: () => void
  } & GroupsActions &
    BlocksActions &
    ItemsActions &
    VariablesActions &
    EdgesActions &
    EventsActions
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
>({})

export const BotProvider = ({ children, botId }: { children: ReactNode; botId?: string }) => {
  const { t } = useTranslate()
  const { showToast } = useToast()
  const setLoadingSave = useLoadingSave()
  const [is404, setIs404] = useState(false)
  const { setGroupsCoordinates } = useGraphGroups()

  const {
    data: botData,
    isLoading: isFetchingBot,
    refetch: refetchBot,
  } = trpc.bot.getBot.useQuery(
    { botId: botId as string, migrateToLatestVersion: true },
    {
      enabled: isDefined(botId),
      retry: 0,
      onError: (error) => {
        if (error.data?.httpStatus === 404) {
          setIs404(true)
          return
        }
        setIs404(false)
        showToast({
          detailsTitle: t('toast.details'),
          title: 'Could not fetch bot',
          description: error.message,
          details: {
            content: JSON.stringify(error.data?.zodError?.fieldErrors, null, 2),
            lang: 'json',
          },
        })
      },
      onSuccess: () => {
        setIs404(false)
      },
    },
  )

  const { data: publishedBotData } = trpc.bot.getPublishedBot.useQuery(
    { botId: botId as string, migrateToLatestVersion: true },
    {
      enabled:
        isDefined(botId) &&
        (botData?.currentUserMode === 'read' || botData?.currentUserMode === 'write'),
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          title: 'Could not fetch published bot',
          description: error.message,
          details: {
            content: JSON.stringify(error.data?.zodError?.fieldErrors, null, 2),
            lang: 'json',
          },
        })
      },
    },
  )

  const { mutateAsync: updateBot, isLoading: isSaving } = trpc.bot.updateBot.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        title: 'Error while updating bot',
        description: error.message,
      })
    },
    onSuccess: () => {
      if (!botId) return
      refetchBot()
    },
  })

  const bot = botData?.bot as BotV6
  const publishedBot = (publishedBotData?.publishedBot ?? undefined) as PublicBotV6 | undefined
  const isReadOnly = botData && ['read', 'guest'].includes(botData?.currentUserMode ?? 'guest')

  const [localBot, { redo, undo, flush, canRedo, canUndo, set: setLocalBot, setUpdateDate }] =
    useUndo<BotV6>(undefined, {
      isReadOnly,
      onUndo: (t) => {
        setGroupsCoordinates(t.groups)
      },
      onRedo: (t) => {
        setGroupsCoordinates(t.groups)
      },
    })

  useEffect(() => {
    if (!bot && isDefined(localBot)) {
      setLocalBot(undefined)
      setGroupsCoordinates(undefined)
    }
    if (isFetchingBot || !bot) return
    if (
      bot.id !== localBot?.id ||
      new Date(bot.updatedAt).getTime() > new Date(localBot.updatedAt).getTime()
    ) {
      setLocalBot({ ...bot })
      setGroupsCoordinates(bot.groups)
      flush()
    }
  }, [flush, isFetchingBot, localBot, setGroupsCoordinates, setLocalBot, showToast, bot])

  const saveBot = useCallback(
    async (updates?: Partial<BotV6>, overwrite?: boolean) => {
      if (!localBot || !bot || isReadOnly) return
      const botToSave = {
        ...localBot,
        ...updates,
      }
      if (
        dequal(
          JSON.parse(JSON.stringify(omit(bot, 'updatedAt'))),
          JSON.parse(JSON.stringify(omit(botToSave, 'updatedAt'))),
        )
      )
        return
      // Ensure null values are preserved and not converted to undefined
      const botToSaveWithNulls = Object.fromEntries(
        Object.entries({ ...botToSave }).map(([key, value]) => [
          key,
          value === null ? null : value,
        ]),
      )
      const newParsedBot = botV6Schema.parse(botToSaveWithNulls)
      setLocalBot(newParsedBot)
      try {
        const { bot } = await updateBot({
          botId: newParsedBot.id,
          bot: newParsedBot,
        })
        setUpdateDate(bot.updatedAt)
        if (overwrite) {
          setLocalBot(bot)
        }
      } catch {
        setLocalBot({
          ...localBot,
        })
      }
    },
    [isReadOnly, localBot, setLocalBot, setUpdateDate, bot, updateBot],
  )

  useAutoSave(
    {
      handler: saveBot,
      item: localBot,
      debounceTimeout: autoSaveTimeout,
    },
    [saveBot, localBot],
  )

  useEffect(() => {
    const handleSaveBot = () => {
      saveBot()
    }
    Router.events.on('routeChangeStart', handleSaveBot)
    return () => {
      Router.events.off('routeChangeStart', handleSaveBot)
    }
  }, [saveBot])

  const isModified = useMemo(
    () => isPublishedHelper(localBot, publishedBot),
    [localBot, publishedBot],
  )

  const isPublished = !!publishedBot

  useEffect(() => {
    if (!localBot || !bot || isReadOnly) return
    if (!areBotsEqual(localBot, bot)) {
      window.addEventListener('beforeunload', preventUserFromRefreshing)
    }

    return () => {
      window.removeEventListener('beforeunload', preventUserFromRefreshing)
    }
  }, [localBot, bot, isReadOnly])

  const updateLocalBot = async ({
    updates,
    save,
    overwrite,
  }: {
    updates: UpdateBotPayload
    save?: boolean
    overwrite?: boolean
  }) => {
    if (!localBot || isReadOnly) return
    const newBot = { ...localBot, ...updates }
    setLocalBot(newBot)
    if (save) await saveBot(newBot, overwrite)
    return newBot
  }

  const restorePublishedBot = async () => {
    if (!publishedBot || !localBot) return
    const restoredBot = convertPublicBotToBot(publishedBot, localBot)
    setLocalBot(restoredBot)
    setGroupsCoordinates(restoredBot.groups)
    flush()
    await saveBot(restoredBot, true)
  }

  useEffect(() => {
    if (isSaving) {
      setLoadingSave()
    }
  }, [isSaving, setLoadingSave])

  return (
    <botContext.Provider
      value={{
        bot: localBot,
        publishedBot: publishedBot,
        publishedBotVersion: publishedBotData?.version,
        currentUserMode: botData?.currentUserMode ?? 'guest',
        isSavingLoading: isSaving,
        is404,
        save: saveBot,
        undo,
        redo,
        canUndo,
        canRedo,
        isPublished,
        isModified,
        updateBot: updateLocalBot,
        restorePublishedBot: restorePublishedBot,
        refetchBot,
        ...groupsActions(setLocalBot as SetBot),
        ...blocksAction(setLocalBot as SetBot),
        ...variablesAction(setLocalBot as SetBot),
        ...edgesAction(setLocalBot as SetBot),
        ...itemsAction(setLocalBot as SetBot),
        ...eventsActions(setLocalBot as SetBot),
      }}
    >
      {children}
    </botContext.Provider>
  )
}

export const useBot = () => useContext(botContext)
