import { createId } from '@quickbot.io/lib/createId'
import { TRPCError } from '@trpc/server'
import { isDefined, omit, isNotEmpty } from '@quickbot.io/lib'
import { isInputBlock } from '@quickbot.io/schemas/helpers'
import {
  Variable,
  VariableWithValue,
  Theme,
  GoogleAnalyticsBlock,
  PixelBlock,
  SessionState,
  BotInSession,
  Block,
  SetVariableHistoryItem,
} from '@quickbot.io/schemas'
import {
  StartChatInput,
  StartChatResponse,
  StartPreviewChatInput,
  StartBot,
  startBotSchema,
} from '@quickbot.io/schemas/features/chat/schema'
import parse, { NodeType } from 'node-html-parser'
import { parseDynamicTheme } from './parseDynamicTheme'
import { findBot } from './queries/findBot'
import { findPublicBot } from './queries/findPublicBot'
import { findResult } from './queries/findResult'
import { startBotFlow } from './startBotFlow'
import { prefillVariables } from '@quickbot.io/variables/prefillVariables'
import { deepParseVariables } from '@quickbot.io/variables/deepParseVariables'
import { injectVariablesFromExistingResult } from '@quickbot.io/variables/injectVariablesFromExistingResult'
import { getNextGroup } from './getNextGroup'
import { upsertResult } from './queries/upsertResult'
import { continueBotFlow } from './continueBotFlow'
import {
  getVariablesToParseInfoInText,
  parseVariables,
} from '@quickbot.io/variables/parseVariables'
import { defaultSettings } from '@quickbot.io/schemas/features/bot/settings/constants'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { BotResultVisitedEdge } from '@quickbot.io/prisma'
import { getFirstEdgeId } from './getFirstEdgeId'
import {
  defaultGuestAvatarIsEnabled,
  defaultHostAvatarIsEnabled,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { parseVariablesInRichText } from './parseBubbleBlock'
import { systemVariables } from '@quickbot.io/variables/system-variables'

type StartParams =
  | ({
      type: 'preview'
      userId?: string
    } & StartPreviewChatInput)
  | ({
      type: 'live'
    } & StartChatInput)

type Props = {
  version: 1 | 2
  startParams: StartParams
  initialSessionState?: Pick<SessionState, 'whatsApp' | 'expiryTimeout'>
}

export const startSession = async ({
  version,
  startParams,
  initialSessionState,
}: Props): Promise<
  Omit<StartChatResponse, 'resultId' | 'isStreamEnabled' | 'sessionId'> & {
    newSessionState: SessionState
    visitedEdges: BotResultVisitedEdge[]
    setVariableHistory: SetVariableHistoryItem[]
    resultId?: string
  }
> => {
  const bot = await getBot(startParams)

  // Merge system variables with bot variables:
  // 1. If a system variable was modified by user, it will be in bot.variables
  // 2. If not modified, use the default from systemVariables
  const mergedSystemVariables = systemVariables.map((sysVar) => {
    const botVar = bot.variables.find((v) => v.id === sysVar.id)
    return botVar || sysVar
  })

  const botVariables = [
    ...bot.variables.filter((v) => !systemVariables.find((sv) => sv.id === v.id)),
    ...mergedSystemVariables,
  ]

  const prefilledVariablesFromParams = startParams.prefilledVariables
    ? prefillVariables(botVariables, startParams.prefilledVariables)
    : botVariables

  const getMomentOfTheDay = () => {
    const now = new Date()
    if (now.getHours() < 12) return 'morning'
    if (now.getHours() >= 12 && now.getHours() < 18) return 'afternoon'
    if (now.getHours() >= 18) return 'evening'
    if (now.getHours() >= 22 || now.getHours() < 6) return 'night'
    return ''
  }

  let prefilledVariables = prefilledVariablesFromParams.map((v) => {
    switch (v.id) {
      case 'system_platform':
        return {
          ...v,
          value: startParams.type === 'preview' ? 'preview' : startParams.platform,
        }
      case 'system_whatsapp_number':
        return {
          ...v,
          value: initialSessionState?.whatsApp?.contact?.phoneNumber ?? '',
        }
      case 'system_whatsapp_name':
        return { ...v, value: initialSessionState?.whatsApp?.contact?.name ?? '' }
      case 'system_randomId':
        return { ...v, value: createId() }
      case 'system_today':
        return { ...v, value: new Date().toISOString() }
      case 'system_now':
        return { ...v, value: new Date().toISOString() }
      case 'system_tomorrow':
        return { ...v, value: new Date(Date.now() + 86400000).toISOString() }
      case 'system_yesterday':
        return { ...v, value: new Date(Date.now() - 86400000).toISOString() }
      case 'system_momentOfTheDay':
        return { ...v, value: getMomentOfTheDay() }
      default:
        return v
    }
  })

  if (startParams.type === 'live' && startParams.platform === 'whatsapp') {
    prefilledVariables = prefilledVariables.map((v) =>
      v.id === 'system_device' && !isDefined(v.value) ? { ...v, value: 'unknown' } : v,
    )
  }

  const result = await getResult({
    resultId: startParams.type === 'live' ? startParams.resultId : undefined,
    isPreview: startParams.type === 'preview',
    botId: bot.id,
    prefilledVariables,
    isRememberUserEnabled:
      bot.settings.general?.rememberUser?.isEnabled ??
      (isDefined(bot.settings.general?.isNewResultOnRefreshEnabled)
        ? !bot.settings.general?.isNewResultOnRefreshEnabled
        : defaultSettings.general.rememberUser.isEnabled),
  })

  const startVariables =
    result && result.variables.length > 0
      ? injectVariablesFromExistingResult(prefilledVariables, result.variables)
      : prefilledVariables

  const botInSession = convertStartBotToBotInSession(bot, startVariables)

  const initialState = buildInitialState(
    bot,
    botInSession,
    startParams,
    result,
    startVariables,
    initialSessionState,
  )

  if (startParams.isOnlyRegistering) {
    return buildRegisteringResponse(bot, initialState)
  }

  let chatReply = await startBotFlow({
    version,
    state: initialState,
    startFrom: startParams.type === 'preview' ? startParams.startFrom : undefined,
    startTime: Date.now(),
    textBubbleContentFormat: startParams.textBubbleContentFormat,
  })

  chatReply = await handleMessageContinuation(chatReply, startParams, version)

  const {
    messages,
    input,
    clientSideActions: startFlowClientActions,
    newSessionState,
    logs,
    visitedEdges,
    setVariableHistory,
  } = chatReply

  const startLogs = logs ?? []
  let clientSideActions = startFlowClientActions ?? []
  clientSideActions = processClientSideActions(clientSideActions, bot, result, startLogs)

  const clientSideActionsNeedSessionId = clientSideActions.some(
    (action) => action.expectsDedicatedReply,
  )

  if (!input && !clientSideActionsNeedSessionId) {
    return buildResponse(
      bot,
      newSessionState,
      messages,
      clientSideActions,
      startLogs,
      visitedEdges,
      setVariableHistory,
    )
  }

  return buildResponse(
    bot,
    newSessionState,
    messages,
    clientSideActions,
    startLogs,
    visitedEdges,
    setVariableHistory,
    true,
    result?.id,
    input,
  )
}

function mapAnswers(
  answers: any[],
  bot: StartBot,
  startVariables: Variable[],
): { key: string; value: string }[] {
  return answers.map((answer) => {
    const block = bot.groups
      .flatMap<Block>((group) => group.blocks)
      .find((block) => block.id === answer.blockId)
    if (!block || !isInputBlock(block)) {
      return {
        key: 'unknown',
        value: String(answer.content),
      }
    }
    const key = block.options?.variableId
      ? startVariables.find((variable) => variable.id === block.options?.variableId)?.name ??
        'unknown'
      : bot.groups.find((group) =>
          group.blocks.some((blockInGroup) => blockInGroup.id === block.id),
        )?.title ?? 'unknown'
    return { key, value: String(answer.content) }
  })
}

function buildInitialState(
  bot: StartBot,
  botInSession: BotInSession,
  startParams: StartParams,
  result: { id?: string; answers: any[] } | undefined,
  startVariables: Variable[],
  initialSessionState?: Pick<SessionState, 'whatsApp' | 'expiryTimeout'>,
): SessionState {
  return {
    version: '3',
    botsQueue: [
      {
        resultId: result?.id,
        bot: botInSession,
        answers: result ? mapAnswers(result.answers, bot, startVariables) : [],
      },
    ],
    dynamicTheme: parseDynamicThemeInState(bot.theme),
    isStreamEnabled: startParams.isStreamEnabled,
    typingEmulation: bot.settings.typingEmulation,
    allowedOrigins:
      startParams.type === 'preview' ? undefined : bot.settings.security?.allowedOrigins,
    progressMetadata:
      initialSessionState?.whatsApp || !bot.theme.general?.progressBar?.isEnabled
        ? undefined
        : { totalAnswers: 0 },
    setVariableIdsForHistory: extractVariableIdsUsedForTranscript(botInSession),
    ...initialSessionState,
  }
}

/**
 * Retorna la respuesta en el caso de que solo se esté registrando la sesión.
 */
function buildRegisteringResponse(bot: StartBot, initialState: SessionState) {
  return {
    newSessionState: initialState,
    bot: {
      id: bot.id,
      settings: deepParseVariables(initialState.botsQueue[0].bot.variables)(bot.settings),
      theme: sanitizeAndParseTheme(bot.theme, {
        variables: initialState.botsQueue[0].bot.variables,
      }),
    },
    dynamicTheme: parseDynamicTheme(initialState),
    messages: [],
    visitedEdges: [],
    setVariableHistory: [],
  }
}

async function handleMessageContinuation(chatReply: any, startParams: StartParams, version: 1 | 2) {
  if (!startParams.message) return chatReply

  const { bot } = chatReply.newSessionState.botsQueue[0]
  const firstEdgeId = getFirstEdgeId({
    bot,
    startEventId:
      startParams.type === 'preview' && startParams.startFrom?.type === 'event'
        ? startParams.startFrom.eventId
        : undefined,
  })

  const nextGroup = await getNextGroup({
    state: chatReply.newSessionState,
    edgeId: firstEdgeId,
    isOffDefaultPath: false,
  })
  const firstBlock = nextGroup.group?.blocks.at(0)
  if (firstBlock && isInputBlock(firstBlock)) {
    const resultId = nextGroup.newSessionState.botsQueue[0].resultId
    if (resultId) {
      await upsertResult({
        hasStarted: true,
        isCompleted: false,
        resultId,
        bot: nextGroup.newSessionState.botsQueue[0].bot,
      })
    }
    chatReply = await continueBotFlow(startParams.message, {
      version,
      state: {
        ...nextGroup.newSessionState,
        currentBlockId: firstBlock.id,
      },
      textBubbleContentFormat: startParams.textBubbleContentFormat,
    })
  }
  return chatReply
}

function processClientSideActions(
  clientSideActions: any[],
  bot: StartBot,
  result: any,
  startLogs: any[],
) {
  const startClientSideAction = parseStartClientSideAction(bot)
  if (isDefined(startClientSideAction)) {
    if (!result) {
      if ('startPropsToInject' in startClientSideAction) {
        const { customHeadCode, googleAnalyticsId, pixelIds, gtmId } =
          startClientSideAction.startPropsToInject
        let toolsList = ''
        if (customHeadCode) toolsList += 'Custom head code, '
        if (googleAnalyticsId) toolsList += 'Google Analytics, '
        if (pixelIds) toolsList += 'Pixel, '
        if (gtmId) toolsList += 'Google Tag Manager, '
        toolsList = toolsList.slice(0, -2)
        startLogs.push({
          description: `${toolsList} ${
            toolsList.includes(',') ? 'are not' : 'is not'
          } enabled in Preview mode`,
          status: 'info',
        })
      }
    } else {
      clientSideActions.unshift(startClientSideAction)
    }
  }
  return clientSideActions
}

function buildResponse(
  bot: StartBot,
  newSessionState: SessionState,
  messages: any,
  clientSideActions: any[],
  logs: any[],
  visitedEdges: BotResultVisitedEdge[],
  setVariableHistory: SetVariableHistoryItem[],
  includeInput: boolean = false,
  resultId?: string,
  input?: any,
) {
  const common = {
    newSessionState,
    messages,
    clientSideActions: clientSideActions.length > 0 ? clientSideActions : undefined,
    bot: {
      id: bot.id,
      settings: deepParseVariables(newSessionState.botsQueue[0].bot.variables)(bot.settings),
      theme: sanitizeAndParseTheme(bot.theme, {
        variables: newSessionState.botsQueue[0].bot.variables,
      }),
      publishedAt: bot.updatedAt,
    },
    dynamicTheme: parseDynamicTheme(newSessionState),
    logs: logs.length > 0 ? logs : undefined,
    visitedEdges,
    setVariableHistory,
  }
  return includeInput ? { ...common, resultId, input } : common
}

const getBot = async (startParams: StartParams): Promise<StartBot> => {
  if (startParams.type === 'preview' && startParams.bot) return startParams.bot

  if (startParams.type === 'preview' && !startParams.userId)
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You need to be authenticated to perform this action',
    })

  const botQuery =
    startParams.type === 'preview'
      ? await findBot({
          id: startParams.botId,
          userId: startParams.userId,
        })
      : await findPublicBot({ publicId: startParams.publicId })
  const parsedBot =
    botQuery && 'bot' in botQuery
      ? {
          id: botQuery.botId,
          ...omit(botQuery.bot, 'workspace'),
          ...omit(botQuery, 'bot', 'botId'),
        }
      : botQuery

  if (!parsedBot || parsedBot.isArchived)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Bot not found',
    })

  const isQuarantinedOrSuspended =
    botQuery &&
    'bot' in botQuery &&
    (botQuery.bot.workspace.isQuarantined || botQuery.bot.workspace.isSuspended)

  if (('isClosed' in parsedBot && parsedBot.isClosed) || isQuarantinedOrSuspended)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Bot is closed',
    })

  return startBotSchema.parse(parsedBot)
}

const getResult = async ({
  isPreview,
  resultId,
  prefilledVariables,
  isRememberUserEnabled,
}: {
  resultId: string | undefined
  isPreview: boolean
  botId: string
  prefilledVariables: Variable[]
  isRememberUserEnabled: boolean
}) => {
  if (isPreview) return
  const existingResult =
    resultId && isRememberUserEnabled ? await findResult({ id: resultId }) : undefined

  const prefilledVariableWithValue = prefilledVariables.filter((prefilledVariable) =>
    isDefined(prefilledVariable.value),
  )

  const updatedResult = {
    variables: prefilledVariableWithValue.concat(
      existingResult?.variables.filter(
        (resultVariable) =>
          isDefined(resultVariable.value) &&
          !prefilledVariableWithValue.some(
            (prefilledVariable) => prefilledVariable.name === resultVariable.name,
          ),
      ) ?? [],
    ) as VariableWithValue[],
  }
  return {
    id: existingResult?.id ?? createId(),
    variables: updatedResult.variables,
    answers: existingResult?.answers ?? [],
  }
}

const parseDynamicThemeInState = (theme: Theme) => {
  const hostAvatarUrl =
    theme.chat?.hostAvatar?.isEnabled ?? defaultHostAvatarIsEnabled
      ? theme.chat?.hostAvatar?.url
      : undefined
  const guestAvatarUrl =
    theme.chat?.guestAvatar?.isEnabled ?? defaultGuestAvatarIsEnabled
      ? theme.chat?.guestAvatar?.url
      : undefined
  if (!hostAvatarUrl?.startsWith('{{') && !guestAvatarUrl?.startsWith('{{')) return
  return {
    hostAvatarUrl: hostAvatarUrl?.startsWith('{{') ? hostAvatarUrl : undefined,
    guestAvatarUrl: guestAvatarUrl?.startsWith('{{') ? guestAvatarUrl : undefined,
  }
}

const parseStartClientSideAction = (
  bot: StartBot,
): NonNullable<StartChatResponse['clientSideActions']>[number] | undefined => {
  const blocks = bot.groups.flatMap<Block>((group) => group.blocks)
  const pixelBlocks = (
    blocks.filter(
      (block) =>
        block.type === IntegrationBlockType.PIXEL &&
        isNotEmpty(block.options?.pixelId) &&
        block.options?.isInitSkip !== true,
    ) as PixelBlock[]
  ).map((pixelBlock) => pixelBlock.options?.pixelId as string)

  const startPropsToInject = {
    customHeadCode: isNotEmpty(bot.settings.metadata?.customHeadCode)
      ? sanitizeAndParseHeadCode(bot.settings.metadata?.customHeadCode as string)
      : undefined,
    gtmId: bot.settings.metadata?.googleTagManagerId,
    googleAnalyticsId: (
      blocks.find(
        (block) =>
          block.type === IntegrationBlockType.GOOGLE_ANALYTICS && block.options?.trackingId,
      ) as GoogleAnalyticsBlock | undefined
    )?.options?.trackingId,
    pixelIds: pixelBlocks.length > 0 ? pixelBlocks : undefined,
  }

  if (
    !startPropsToInject.customHeadCode &&
    !startPropsToInject.gtmId &&
    !startPropsToInject.googleAnalyticsId &&
    !startPropsToInject.pixelIds
  )
    return

  return { type: 'startPropsToInject', startPropsToInject }
}

const sanitizeAndParseTheme = (theme: Theme, { variables }: { variables: Variable[] }): Theme => ({
  general: theme.general ? deepParseVariables(variables)(theme.general) : undefined,
  chat: theme.chat ? deepParseVariables(variables)(theme.chat) : undefined,
  customCss: theme.customCss
    ? removeLiteBadgeCss(parseVariables(variables)(theme.customCss))
    : undefined,
})

const sanitizeAndParseHeadCode = (code: string) => {
  code = removeLiteBadgeCss(code)
  return parse(code)
    .childNodes.filter((child) => child.nodeType !== NodeType.TEXT_NODE)
    .join('\n')
}

const removeLiteBadgeCss = (code: string) => {
  const liteBadgeCssRegex = /.*#lite-badge.*{[\s\S][^{]*}/gm
  return code.replace(liteBadgeCssRegex, '')
}

const convertStartBotToBotInSession = (bot: StartBot, startVariables: Variable[]): BotInSession =>
  bot.version === '6'
    ? {
        version: bot.version,
        id: bot.id,
        groups: bot.groups,
        edges: bot.edges,
        variables: startVariables,
        events: bot.events,
      }
    : {
        version: bot.version,
        id: bot.id,
        groups: bot.groups,
        edges: bot.edges,
        variables: startVariables,
        events: bot.events,
      }

const extractVariableIdsUsedForTranscript = (bot: BotInSession): string[] => {
  const variableIds: Set<string> = new Set()
  const parseVarParams = {
    variables: bot.variables,
    takeLatestIfList: bot.version !== '6',
  }
  bot.groups.forEach((group) => {
    group.blocks.forEach((block) => {
      if (block.type === BubbleBlockType.TEXT) {
        const { parsedVariableIds } = parseVariablesInRichText(
          block.content?.richText ?? [],
          parseVarParams,
        )
        parsedVariableIds.forEach((variableId) => variableIds.add(variableId))
      }
      if (
        block.type === BubbleBlockType.IMAGE ||
        block.type === BubbleBlockType.VIDEO ||
        block.type === BubbleBlockType.AUDIO
      ) {
        if (!block.content?.url) return
        const variablesInfo = getVariablesToParseInfoInText(block.content.url, parseVarParams)
        variablesInfo.forEach((variableInfo) =>
          variableInfo.variableId ? variableIds.add(variableInfo.variableId ?? '') : undefined,
        )
      }
      if (block.type === LogicBlockType.CONDITION) {
        block.items.forEach((item) =>
          item.content?.comparisons?.forEach((comparison) => {
            if (comparison.variableId) variableIds.add(comparison.variableId)
            if (comparison.value) {
              const variableIdsInValue = getVariablesToParseInfoInText(
                comparison.value,
                parseVarParams,
              )
              variableIdsInValue.forEach((variableInfo) => {
                variableInfo.variableId ? variableIds.add(variableInfo.variableId) : undefined
              })
            }
          }),
        )
      }
    })
  })
  return [...variableIds]
}
