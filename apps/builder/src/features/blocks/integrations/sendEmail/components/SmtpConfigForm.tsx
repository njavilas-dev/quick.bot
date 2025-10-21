import { InputTextWithVariables, InputNumberWithVariables } from '@/components/inputs'
import { Switch, FormControl } from '@urbiport/ui'
import { Stack } from '@chakra-ui/react'
import { isDefined } from '@quickbot.io/lib'
import { SmtpCredentials } from '@quickbot.io/schemas'
import React from 'react'
import { useTranslate } from '@tolgee/react'

type Props = {
  config: SmtpCredentials['data'] | undefined
  onConfigChange: (config: SmtpCredentials['data']) => void
}

export const SmtpConfigForm = ({ config, onConfigChange }: Props) => {
  const { t } = useTranslate()

  const handleFromEmailChange = (email: string) =>
    config && onConfigChange({ ...config, from: { ...config.from, email } })

  const handleFromNameChange = (name: string) =>
    config && onConfigChange({ ...config, from: { ...config.from, name } })

  const handleHostChange = (host: string) => config && onConfigChange({ ...config, host })

  const handleUsernameChange = (username: string) =>
    config && onConfigChange({ ...config, username })

  const handlePasswordChange = (password: string) =>
    config && onConfigChange({ ...config, password })

  const handleTlsCheck = (isTlsEnabled: boolean) =>
    config && onConfigChange({ ...config, isTlsEnabled })

  const handlePortNumberChange = (port?: number) =>
    config && isDefined(port) && onConfigChange({ ...config, port })

  return (
    <Stack spacing={6}>
      <FormControl
        isRequired
        label={t('editor.blocks.integrations.sendEmail.settings.fromEmail.label')}
      >
        <InputTextWithVariables
          defaultValue={config?.from.email}
          onChange={handleFromEmailChange}
          placeholder={t('editor.blocks.integrations.sendEmail.settings.fromEmail.placeholder')}
          isDisabled={!config}
        />
      </FormControl>
      <FormControl label={t('editor.blocks.integrations.sendEmail.settings.fromName.label')}>
        <InputTextWithVariables
          defaultValue={config?.from.name}
          onChange={handleFromNameChange}
          placeholder={t('editor.blocks.integrations.sendEmail.settings.fromName.placeholder')}
          isDisabled={!config}
        />
      </FormControl>
      <FormControl isRequired label={t('editor.blocks.integrations.sendEmail.settings.host.label')}>
        <InputTextWithVariables
          defaultValue={config?.host}
          onChange={handleHostChange}
          placeholder={t('editor.blocks.integrations.sendEmail.settings.host.placeholder')}
          isDisabled={!config}
        />
      </FormControl>
      <FormControl
        isRequired
        label={t('editor.blocks.integrations.sendEmail.settings.username.label')}
      >
        <InputTextWithVariables
          defaultValue={config?.username}
          onChange={handleUsernameChange}
          isDisabled={!config}
        />
      </FormControl>
      <FormControl
        isRequired
        label={t('editor.blocks.integrations.sendEmail.settings.password.label')}
      >
        <InputTextWithVariables
          type="password"
          defaultValue={config?.password}
          onChange={handlePasswordChange}
          isDisabled={!config}
        />
      </FormControl>
      <FormControl
        direction="row"
        label={t('editor.blocks.integrations.sendEmail.settings.secure.label')}
        moreInfoTooltip={t('editor.blocks.integrations.sendEmail.settings.secure.tooltip')}
      >
        <Switch
          defaultValue={config?.isTlsEnabled}
          onChange={handleTlsCheck}
          isDisabled={!config}
        />
      </FormControl>
      <FormControl
        isRequired
        label={t('editor.blocks.integrations.sendEmail.settings.portNumber.label')}
      >
        <InputNumberWithVariables
          placeholder={t('editor.blocks.integrations.sendEmail.settings.portNumber.placeholder')}
          defaultValue={config?.port}
          onChange={handlePortNumberChange}
          isDisabled={!config}
        />
      </FormControl>
    </Stack>
  )
}
