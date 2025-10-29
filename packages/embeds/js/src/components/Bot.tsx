import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { isDefined, isNotDefined, isNotEmpty } from '@quickbot.io/lib'
import { startChatQuery } from '@/queries/startChatQuery'
import { ConversationContainer } from './ConversationContainer'
import { setIsMobile } from '@/utils/isMobileSignal'
import { BotContext, OutgoingLog } from '@/types'
import { ErrorMessage } from './ErrorMessage'
import {
  getExistingResultIdFromStorage,
  getInitialChatReplyFromStorage,
  setInitialChatReplyInStorage,
  setResultInStorage,
  wipeExistingChatStateInStorage,
} from '@/utils/storage'
import { setCssVariablesValue } from '@/utils/setCssVariablesValue'
import { Font, InputBlock, StartChatResponse, StartFrom } from '@quickbot.io/schemas'
import { clsx } from 'clsx'
import { HTTPError } from 'ky'
import { injectFont } from '@/utils/injectFont'
import { ProgressBar } from './ProgressBar'
import { Portal } from 'solid-js/web'
import { defaultSettings } from '@quickbot.io/schemas/features/bot/settings/constants'
import { persist } from '@/utils/persist'
import { setBotContainerHeight } from '@/utils/botContainerHeightSignal'
import {
  defaultFontFamily,
  defaultFontType,
  defaultProgressBarPosition,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { CorsError } from '@/utils/CorsError'
import { Toaster, Toast } from '@ark-ui/solid'
import { CloseIcon } from './icons/CloseIcon'
import { toaster } from '@/utils/toaster'
import { setBotContainer } from '@/utils/botContainerSignal'

export type BotProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bot: string | any
  isPreview?: boolean
  resultId?: string
  prefilledVariables?: Record<string, unknown>
  apiHost?: string
  font?: Font
  progressBarRef?: HTMLDivElement
  startFrom?: StartFrom
  sessionId?: string
  onNewInputBlock?: (inputBlock: InputBlock) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onInit?: () => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
  onChatStatePersisted?: (isEnabled: boolean) => void
}

export const Bot = (props: BotProps & { class?: string }) => {
  const [initialChatReply, setInitialChatReply] = createSignal<StartChatResponse | undefined>()
  const [customCss, setCustomCss] = createSignal('')
  const [isInitialized, setIsInitialized] = createSignal(false)
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal<Error | undefined>()

  const initializeBot = async () => {
    if (props.font) injectFont(props.font)
    setIsInitialized(true)
    setIsLoading(true)
    const urlParams = new URLSearchParams(location.search)
    props.onInit?.()
    const prefilledVariables: { [key: string]: string } = {}
    urlParams.forEach((value, key) => {
      prefilledVariables[key] = value
    })
    const botIdFromProps = typeof props.bot === 'string' ? props.bot : undefined

    const isPreview = typeof props.bot !== 'string' || (props.isPreview ?? false)
    const resultIdInStorage = getExistingResultIdFromStorage(botIdFromProps)

    const { data, error } = await startChatQuery({
      stripeRedirectStatus: urlParams.get('redirect_status') ?? undefined,
      bot: props.bot,
      apiHost: props.apiHost,
      isPreview,
      resultId: isNotEmpty(props.resultId) ? props.resultId : resultIdInStorage,
      prefilledVariables: {
        ...prefilledVariables,
        ...props.prefilledVariables,
      },
      startFrom: props.startFrom,
      sessionId: props.sessionId,
    })
    if (error instanceof HTTPError) {
      setIsLoading(false)
      if (isPreview) {
        return setError(
          new Error(`An error occurred while loading the bot.`, {
            cause: {
              status: error.response.status,
              body: await error.response.json(),
            },
          }),
        )
      }
      if (error.response.status === 400 || error.response.status === 403)
        return setError(new Error('This bot is now closed.'))
      if (error.response.status === 404)
        return setError(new Error("The bot you're looking for doesn't exist."))
      return setError(
        new Error(`Error! Couldn't initiate the chat. (${error.response.statusText})`),
      )
    }

    if (error instanceof CorsError) {
      setIsLoading(false)
      return setError(new Error(error.message))
    }

    if (!data) {
      setIsLoading(false)
      if (error) {
        console.error(error)
        if (isPreview) {
          return setError(
            new Error('Error! Could not reach server. Check your connection.', {
              cause: error,
            }),
          )
        }
      }
      return setError(new Error('Error! Could not reach server. Check your connection.'))
    }

    if (
      data.resultId &&
      botIdFromProps &&
      (data.bot.settings.general?.rememberUser?.isEnabled ??
        defaultSettings.general.rememberUser.isEnabled)
    ) {
      if (resultIdInStorage && resultIdInStorage !== data.resultId) {
        wipeExistingChatStateInStorage(botIdFromProps)
      }

      const storage =
        data.bot.settings.general?.rememberUser?.storage ??
        defaultSettings.general.rememberUser.storage

      setResultInStorage(storage as 'local' | 'session' | undefined)(botIdFromProps, data.resultId)

      const initialChatInStorage = getInitialChatReplyFromStorage(botIdFromProps)
      if (initialChatInStorage && initialChatInStorage.bot.publishedAt && data.bot.publishedAt) {
        if (
          new Date(initialChatInStorage.bot.publishedAt).getTime() ===
          new Date(data.bot.publishedAt).getTime()
        ) {
          setInitialChatReply(initialChatInStorage)
        } else {
          // Restart chat by resetting remembered state
          wipeExistingChatStateInStorage(botIdFromProps)
          setInitialChatReply(data)
          setInitialChatReplyInStorage(data, {
            botId: botIdFromProps,
            storage: storage as 'session' | 'local' | undefined,
          })
        }
      } else {
        setInitialChatReply(data)
        setInitialChatReplyInStorage(data, {
          botId: botIdFromProps,
          storage: storage as 'session' | 'local' | undefined,
        })
      }
      props.onChatStatePersisted?.(true)
    } else {
      wipeExistingChatStateInStorage(botIdFromProps || data.bot.id)
      setInitialChatReply(data)
      if (data.input?.id && props.onNewInputBlock) props.onNewInputBlock(data.input)
      if (data.logs) props.onNewLogs?.(data.logs)
      props.onChatStatePersisted?.(false)
    }

    setCustomCss(data.bot.theme.customCss ?? '')
    setIsLoading(false)
  }

  createEffect(() => {
    if (isNotDefined(props.bot) || isInitialized()) return
    initializeBot().then()
  })

  createEffect(() => {
    if (isNotDefined(props.bot) || typeof props.bot === 'string') return
    setCustomCss(props.bot.theme.customCss ?? '')
    if (
      props.bot.theme.general?.progressBar?.isEnabled &&
      initialChatReply() &&
      !initialChatReply()?.bot.theme.general?.progressBar?.isEnabled
    ) {
      setIsInitialized(false)
      initializeBot().then()
    }
  })

  onCleanup(() => {
    setIsInitialized(false)
  })

  return (
    <>
      <style>{customCss()}</style>
      <Show when={error()} keyed>
        {(error) => <ErrorMessage error={error} />}
      </Show>
      <Show when={isLoading() && !error()}>
        <BotSpinner />
      </Show>
      <Show when={initialChatReply()} keyed>
        {(initialChatReply) => (
          <BotContent
            class={props.class}
            initialChatReply={{
              ...initialChatReply,
              bot: {
                ...initialChatReply.bot,
                settings:
                  typeof props.bot === 'string'
                    ? initialChatReply.bot?.settings
                    : props.bot?.settings,
                theme:
                  typeof props.bot === 'string' ? initialChatReply.bot?.theme : props.bot?.theme,
              },
            }}
            context={{
              apiHost: props.apiHost,
              isPreview: typeof props.bot !== 'string' || (props.isPreview ?? false),
              resultId: initialChatReply.resultId,
              sessionId: initialChatReply.sessionId,
              bot: initialChatReply.bot,
              storage:
                initialChatReply.bot.settings.general?.rememberUser?.isEnabled &&
                !(typeof props.bot !== 'string' || (props.isPreview ?? false))
                  ? ((initialChatReply.bot.settings.general?.rememberUser?.storage ??
                      defaultSettings.general.rememberUser.storage) as
                      | 'session'
                      | 'local'
                      | undefined)
                  : undefined,
            }}
            progressBarRef={props.progressBarRef}
            onNewInputBlock={props.onNewInputBlock}
            onNewLogs={props.onNewLogs}
            onAnswer={props.onAnswer}
            onEnd={props.onEnd}
          />
        )}
      </Show>
    </>
  )
}

type BotContentProps = {
  initialChatReply: StartChatResponse
  context: BotContext
  class?: string
  progressBarRef?: HTMLDivElement
  onNewInputBlock?: (inputBlock: InputBlock) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
}

const BotContent = (props: BotContentProps) => {
  const [progressValue, setProgressValue] = persist(
    createSignal<number | undefined>(props.initialChatReply.progress),
    {
      storage: props.context.storage,
      key: `bot-${props.context.bot.id}-progressValue`,
    },
  )
  let botContainerElement: HTMLDivElement | undefined

  const resizeObserver = new ResizeObserver((entries) => {
    return setIsMobile(entries[0].target.clientWidth < 400)
  })

  onMount(() => {
    if (!botContainerElement) return
    setBotContainer(botContainerElement)
    resizeObserver.observe(botContainerElement)
    setBotContainerHeight(`${botContainerElement.clientHeight}px`)
  })

  createEffect(() => {
    injectFont(
      props.initialChatReply.bot.theme.general?.font ?? {
        type: defaultFontType,
        family: defaultFontFamily,
      },
    )
    if (!botContainerElement) return
    setCssVariablesValue(
      props.initialChatReply.bot.theme,
      botContainerElement,
      props.context.isPreview,
    )
  })

  onCleanup(() => {
    if (!botContainerElement) return
    resizeObserver.unobserve(botContainerElement)
  })

  return (
    <div
      ref={botContainerElement}
      class={clsx('h-full w-full flex flex-col quickbot', props.class)}
    >
      <Show
        when={
          isDefined(progressValue()) &&
          props.initialChatReply.bot.theme.general?.progressBar?.isEnabled
        }
      >
        <Show
          when={
            props.progressBarRef &&
            (props.initialChatReply.bot.theme.general?.progressBar?.position ??
              defaultProgressBarPosition) === 'fixed'
          }
          fallback={<ProgressBar value={progressValue() as number} />}
        >
          <Portal mount={props.progressBarRef}>
            <ProgressBar value={progressValue() as number} />
          </Portal>
        </Show>
      </Show>
      <ConversationContainer
        botContainer={botContainerElement}
        context={props.context}
        initialChatReply={props.initialChatReply}
        onNewInputBlock={props.onNewInputBlock}
        onAnswer={props.onAnswer}
        onEnd={props.onEnd}
        onNewLogs={props.onNewLogs}
        onProgressUpdate={setProgressValue}
      />
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast().title}</Toast.Title>
            <Toast.Description>{toast().description}</Toast.Description>
            <Toast.CloseTrigger class="absolute right-2 top-2">
              <CloseIcon class="w-4 h-4" />
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

type BotSpinnerProps = {
  color?: string
}
// eslint-disable-next-line solid/no-destructure
const BotSpinner = ({ color = 'text-blue-500' }: BotSpinnerProps) => {
  return (
    <div class="flex items-center justify-center h-full w-full">
      <svg
        class={`animate-spin h-8 w-8 ${color}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}
