import prisma from '@quickbot.io/lib/prisma'
import {
  ContinueChatResponse,
  PublicBot,
  SessionState,
  SetVariableHistoryItem,
  Settings,
  Bot,
} from '@quickbot.io/schemas'
import {
  WhatsAppCredentials,
} from '@quickbot.io/schemas/features/whatsapp'
import { isNotDefined } from '@quickbot.io/lib/utils'
import { startSession } from '../startSession'
import {
  LogicalOperator,
  ComparisonOperators,
} from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { BotResultVisitedEdge } from '@quickbot.io/prisma'
import { Reply } from '../types'

const DEFAULT_SESSION_EXPIRATION_TIME = 4

type Props = {
  incomingMessage?: Reply
  workspaceId: string
  credentials: WhatsAppCredentials['data'] & Pick<WhatsAppCredentials, 'id'>
  contact: NonNullable<SessionState['whatsApp']>['contact']
}

export const startWhatsAppSession = async ({
  incomingMessage,
  workspaceId,
  credentials,
  contact,
}: Props): Promise<
  | (ContinueChatResponse & {
    newSessionState: SessionState
    visitedEdges: BotResultVisitedEdge[]
    setVariableHistory: SetVariableHistoryItem[]
  })
  | { error: string }
> => {
  const publicBotsWithWhatsAppEnabled = (
    await prisma.botPublic.findMany({
      where: {
        bot: { workspaceId, whatsAppCredentialsId: credentials.id },
      },
      select: {
        settings: true,
        bot: {
          select: {
            publicId: true,
          },
        },
      },
    })
  ).map(({ bot, settings }) => ({
    settings,
    bot: {
      publicId: bot.publicId,
    },
  })) as (Pick<PublicBot, 'settings'> & {
    bot: Pick<Bot, 'publicId'>
  })[]

  const botsWithWhatsAppEnabled = publicBotsWithWhatsAppEnabled.filter(
    (publicBot) => publicBot.bot.publicId && publicBot.settings.whatsApp?.isEnabled,
  )

  const publicBWithMatchedCondition = botsWithWhatsAppEnabled.find(
    (publicBot) =>
      (publicBot.settings.whatsApp?.startCondition?.comparisons.length ?? 0) > 0 &&
      messageMatchStartCondition(
        incomingMessage ?? { type: 'text', text: '' },
        publicBot.settings.whatsApp?.startCondition,
      ),
  )

  const publicBot =
    publicBWithMatchedCondition ??
    botsWithWhatsAppEnabled.find((publicBot) => !publicBot.settings.whatsApp?.startCondition)

  if (isNotDefined(publicBot))
    return botsWithWhatsAppEnabled.length > 0
      ? { error: 'Message did not matched any condition' }
      : { error: 'No public bot with WhatsApp integration found' }

  const sessionExpiryTimeoutHours =
    publicBot.settings.whatsApp?.sessionExpiryTimeout ?? DEFAULT_SESSION_EXPIRATION_TIME

  return startSession({
    version: 2,
    startParams: {
      type: 'live',
      publicId: publicBot.bot.publicId as string,
      isOnlyRegistering: false,
      isStreamEnabled: false,
      textBubbleContentFormat: 'richText',
      message: incomingMessage,
      platform: 'whatsapp',
    },
    initialSessionState: {
      whatsApp: {
        contact,
      },
      expiryTimeout: sessionExpiryTimeoutHours * 60 * 60 * 1000,
    },
  })
}

const messageMatchStartCondition = (
  message: Reply,
  startCondition: NonNullable<Settings['whatsApp']>['startCondition'],
) => {
  if (!startCondition) return true
  if (message?.type !== 'text' || !message.text) return false
  return startCondition.logicalOperator === LogicalOperator.AND
    ? startCondition.comparisons.every((comparison) =>
      matchComparison(message.text, comparison.comparisonOperator, comparison.value),
    )
    : startCondition.comparisons.some((comparison) =>
      matchComparison(message.text, comparison.comparisonOperator, comparison.value),
    )
}

const matchComparison = (
  inputValue: string,
  comparisonOperator?: ComparisonOperators,
  value?: string,
): boolean | undefined => {
  if (!comparisonOperator) return false
  switch (comparisonOperator) {
    case ComparisonOperators.CONTAINS: {
      if (!value) return false
      return inputValue.trim().toLowerCase().includes(value.trim().toLowerCase())
    }
    case ComparisonOperators.EQUAL: {
      return inputValue === value
    }
    case ComparisonOperators.NOT_EQUAL: {
      return inputValue !== value
    }
    case ComparisonOperators.GREATER: {
      if (!value) return false
      return parseFloat(inputValue) > parseFloat(value)
    }
    case ComparisonOperators.LESS: {
      if (!value) return false
      return parseFloat(inputValue) < parseFloat(value)
    }
    case ComparisonOperators.IS_SET: {
      return inputValue.length > 0
    }
    case ComparisonOperators.IS_EMPTY: {
      return inputValue.length === 0
    }
    case ComparisonOperators.STARTS_WITH: {
      if (!value) return false
      return inputValue.toLowerCase().startsWith(value.toLowerCase())
    }
    case ComparisonOperators.ENDS_WITH: {
      if (!value) return false
      return inputValue.toLowerCase().endsWith(value.toLowerCase())
    }
    case ComparisonOperators.NOT_CONTAINS: {
      if (!value) return false
      return !inputValue.trim().toLowerCase().includes(value.trim().toLowerCase())
    }
  }
}
