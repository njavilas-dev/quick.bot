import { option, AuthDefinition } from '@quickbot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'Tiwilio.com account',
  schema: option.object({
    authToken: option.string.layout({
      label: 'AuthToken',
      isRequired: true,
      inputType: 'password',
      helperText: 'Generate an auth token code in your twilio console.',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    accountSid: option.string.layout({
      label: 'Account SID',
      isRequired: true,
      inputType: 'password',
      helperText: 'Get your Account SID from your twilio console',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    phoneAdminNumber: option.string.layout({
      label: 'Phone number',
      isRequired: true,
      inputType: 'password',
      helperText: 'Example phone',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition
