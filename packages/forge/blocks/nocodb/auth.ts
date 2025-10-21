import { option, AuthDefinition } from '@quickbot.io/forge'
import { defaultBaseUrl } from './constants'

export const auth = {
  type: 'encryptedCredentials',
  name: 'NocoDB account',
  schema: option.object({
    baseUrl: option.url
      .layout({
        label: 'Base URL',
        isRequired: true,
        withVariableButton: false,
        defaultValue: defaultBaseUrl,
      })
      .transform((value) => value?.replace(/\/$/, '')),
    apiKey: option.string.layout({
      label: 'API Token',
      isRequired: true,
      helperText: 'You can generate an API token [here](https://app.nocodb.com/#/account/tokens)',
      inputType: 'password',
      withVariableButton: false,
    }),
  }),
} satisfies AuthDefinition
