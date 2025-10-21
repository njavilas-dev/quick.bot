export const defaultSettings = {
  general: {
    isInputPrefillEnabled: false,
    isHideQueryParamsEnabled: true,
    isNewResultOnRefreshEnabled: true,
    rememberUser: {
      isEnabled: false,
      storage: 'session',
    },
    isBrandingEnabled: false,
    isTypingEmulationEnabled: true,
  },
  typingEmulation: {
    enabled: true,
    speed: 400,
    maxDelay: 3,
    delayBetweenBubbles: 0,
    isDisabledOnFirstMessage: true,
  },
  metadata: {
    description:
      'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.',
    favIconUrl: (viewerBaseUrl: string) => viewerBaseUrl + '/favicon.png',
    imageUrl: (_viewerBaseUrl: string) => '',
  },
} as const

export const rememberUserStorages = [
  { value: 'session', label: 'Session' },
  { value: 'local', label: 'Local' },
]

export const rememberUserStoragesValues = rememberUserStorages.map(p => p.value) as [string, ...string[]]
