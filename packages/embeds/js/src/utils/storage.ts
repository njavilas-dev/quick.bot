import { StartChatResponse } from '@quickbot.io/schemas/features/chat/schema'
import { defaultSettings } from '@quickbot.io/schemas/features/bot/settings/constants'

const storageResultIdKey = 'resultId'

export const getExistingResultIdFromStorage = (botId?: string) => {
  if (!botId) return
  try {
    return (
      sessionStorage.getItem(`${storageResultIdKey}-${botId}`) ??
      localStorage.getItem(`${storageResultIdKey}-${botId}`) ??
      undefined
    )
  } catch {
    /* empty */
  }
}

export const setResultInStorage =
  (storageType: 'local' | 'session' = 'session') =>
  (botId: string, resultId: string) => {
    try {
      parseRememberUserStorage(storageType).setItem(`${storageResultIdKey}-${botId}`, resultId)
    } catch {
      /* empty */
    }
  }

export const getInitialChatReplyFromStorage = (botId: string | undefined) => {
  if (!botId) return
  try {
    const rawInitialChatReply =
      sessionStorage.getItem(`bot-${botId}-initialChatReply`) ??
      localStorage.getItem(`bot-${botId}-initialChatReply`)
    if (!rawInitialChatReply) return
    return JSON.parse(rawInitialChatReply) as StartChatResponse
  } catch {
    /* empty */
  }
}
export const setInitialChatReplyInStorage = (
  initialChatReply: StartChatResponse,
  {
    botId,
    storage,
  }: {
    botId: string
    storage?: 'local' | 'session'
  },
) => {
  try {
    const rawInitialChatReply = JSON.stringify(initialChatReply)
    parseRememberUserStorage(storage).setItem(`bot-${botId}-initialChatReply`, rawInitialChatReply)
  } catch {
    /* empty */
  }
}

export const setBotOpenedStateInStorage = () => {
  try {
    sessionStorage.setItem(`bot-botOpened`, 'true')
  } catch {
    /* empty */
  }
}

export const removeBotOpenedStateInStorage = () => {
  try {
    sessionStorage.removeItem(`bot-botOpened`)
  } catch {
    /* empty */
  }
}

export const getBotOpenedStateFromStorage = () => {
  try {
    return sessionStorage.getItem(`bot-botOpened`) === 'true'
  } catch {
    return false
  }
}

const parseRememberUserStorage = (
  storage: 'local' | 'session' | undefined,
): typeof localStorage | typeof sessionStorage =>
  (storage ?? defaultSettings.general.rememberUser.storage) === 'session'
    ? sessionStorage
    : localStorage

export const wipeExistingChatStateInStorage = (botId: string) => {
  // Try to get the internal bot.id from initialChatReply
  let internalBotId: string | undefined
  try {
    const initialChatReply = getInitialChatReplyFromStorage(botId)
    if (initialChatReply?.bot?.id) {
      internalBotId = initialChatReply.bot.id
    }
  } catch {
    // Ignore errors, we'll just use the publicId
  }

  // Create prefixes for both publicId and internal bot.id
  const prefixes = [
    `bot-${botId}`,
    `resultId-${botId}`,
  ]

  // If we found an internal bot.id different from publicId, add those prefixes too
  if (internalBotId && internalBotId !== botId) {
    prefixes.push(`bot-${internalBotId}`)
    prefixes.push(`resultId-${internalBotId}`)
  }

  const storages = [localStorage, sessionStorage]

  storages.forEach((storage) => {
    Object.keys(storage).forEach((key) => {
      if (prefixes.some((prefix) => key.startsWith(prefix))) {
        storage.removeItem(key)
      }
    })
  })
}
