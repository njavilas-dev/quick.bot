import { option, AuthDefinition } from '@quickbot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'WordPress Authentication',
  schema: option.object({
    clientId: option.string.layout({
      label: 'Client ID',
      isRequired: true,
      helperText: 'Your miniOrange OAuth Client ID',
    }),
    clientSecret: option.string.layout({
      label: 'Client Secret',
      isRequired: true,
      helperText: 'Your miniOrange OAuth Client Secret',
    }),
    tokenEndpoint: option.url.layout({
      label: 'Token Endpoint',
      isRequired: true,
      helperText: 'URL of the token endpoint (e.g., https://my-site.com/wp-json/mo_oauth/token)',
    }),
    adminUsername: option.string.layout({
      label: 'Admin Email',
      isRequired: true,
      helperText: 'WordPress admin email address (required for user registration)',
    }),
    adminPassword: option.string.layout({
      label: 'Application Password',
      isRequired: true,
      helperText: 'WordPress application password (required for user registration)',
    }),
  }),
} satisfies AuthDefinition
