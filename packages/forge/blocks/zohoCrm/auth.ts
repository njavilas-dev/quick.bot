import { option, AuthDefinition } from '@quickbot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'Zoho CRM account',
  schema: option.object({
    clientId: option.string.layout({
      label: 'Client ID',
      isRequired: true,
      helperText: 'Create a Self Client in Zoho Developer Console at https://api-console.zoho.com/',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    clientSecret: option.string.layout({
      label: 'Client Secret',
      isRequired: true,
      inputType: 'password',
      helperText: 'Client Secret from your Zoho Self Client application',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    organizationId: option.string.layout({
      label: 'Organization ID (SOID)',
      isRequired: true,
      helperText: 'Go to your Zoho CRM profile → Click dropdown → Copy the Org ID (e.g., 600xxx46)',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    domain: option.url.layout({
      label: 'Zoho CRM URL',
      isRequired: true,
      helperText: 'Your full Zoho CRM URL, e.g., https://crm.zoho.com/ or https://crm.zoho.eu/',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition
