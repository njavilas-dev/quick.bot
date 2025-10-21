import { SessionState, ContinueChatResponse } from '@quickbot.io/schemas'
import { parseVariables } from '@quickbot.io/variables/parseVariables'

export const parseDynamicTheme = (
  state: SessionState | undefined,
): ContinueChatResponse['dynamicTheme'] => {
  if (!state?.dynamicTheme) return
  return {
    hostAvatarUrl: parseVariables(state?.botsQueue[0].bot.variables)(
      state.dynamicTheme.hostAvatarUrl,
    ),
    guestAvatarUrl: parseVariables(state?.botsQueue[0].bot.variables)(
      state.dynamicTheme.guestAvatarUrl,
    ),
  }
}
