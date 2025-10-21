import { option, AuthDefinition } from '@quickbot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'FreshDesk credentials',
  schema: option.object({
    domain: option.url.layout({
      label: 'FreshDesk Domain',
      isRequired: true,
      helperText: 'Your FreshDesk domain (e.g. https://yourcompany.freshdesk.com)',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    apiKey: option.string.layout({
      label: 'API Key',
      isRequired: true,
      inputType: 'password',
      helperText: 'Your FreshDesk API key',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition
