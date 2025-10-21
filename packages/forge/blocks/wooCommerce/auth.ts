import { option, AuthDefinition } from '@quickbot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'WooCommerce credentials',
  schema: option.object({
    siteUrl: option.url.layout({
      label: 'Site URL',
      isRequired: true,
      helperText: 'Your WordPress site URL (e.g., https://yourcompany.com/wordpress)',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    consumerKey: option.string.layout({
      label: 'Consumer Key',
      isRequired: true,
      inputType: 'password',
      helperText: 'Your WooCommerce REST API consumer key',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    consumerSecret: option.string.layout({
      label: 'Consumer Secret',
      isRequired: true,
      inputType: 'password',
      helperText: 'Your WooCommerce REST API consumer secret',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition
