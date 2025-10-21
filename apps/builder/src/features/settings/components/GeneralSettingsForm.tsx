import { Stack, Tag, Text } from '@chakra-ui/react'
import { Settings } from '@quickbot.io/schemas'
import React from 'react'
import { isDefined } from '@quickbot.io/lib'
import {
  defaultSettings,
  rememberUserStorages,
} from '@quickbot.io/schemas/features/bot/settings/constants'
import { useTranslate } from '@tolgee/react'
import { Control, Switch, FormControl, ButtonSwitch } from '@urbiport/ui'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'

type Props = {
  generalSettings: Settings['general'] | undefined
  onGeneralSettingsChange: (generalSettings: Settings['general']) => void
}

export const GeneralSettingsForm = ({ generalSettings, onGeneralSettingsChange }: Props) => {
  const { t } = useTranslate()
  const toggleRememberUser = (isEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      rememberUser: {
        ...generalSettings?.rememberUser,
        isEnabled,
      },
    })

  const handleInputPrefillChange = (isInputPrefillEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isInputPrefillEnabled,
    })

  const handleHideQueryParamsChange = (isHideQueryParamsEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isHideQueryParamsEnabled,
    })

  const updateRememberUserStorage = (
    storage: NonNullable<NonNullable<Settings['general']>['rememberUser']>['storage'],
  ) =>
    onGeneralSettingsChange({
      ...generalSettings,
      rememberUser: {
        ...generalSettings?.rememberUser,
        storage,
      },
    })

  return (
    <Stack spacing={3}>
      <FormControl
        direction="row"
        label={t('settings.generalSettings.form.prefillInput')}
        moreInfoTooltip={t('settings.generalSettings.form.prefillInput.info')}
      >
        <Switch
          defaultValue={
            generalSettings?.isInputPrefillEnabled ?? defaultSettings.general.isInputPrefillEnabled
          }
          onChange={handleInputPrefillChange}
        />
      </FormControl>
      <FormControl
        direction="row"
        label={t('settings.generalSettings.form.query')}
        moreInfoTooltip={t('settings.generalSettings.form.query.info')}
      >
        <Switch
          defaultValue={
            generalSettings?.isHideQueryParamsEnabled ??
            defaultSettings.general.isHideQueryParamsEnabled
          }
          onChange={handleHideQueryParamsChange}
        />
      </FormControl>
      <Control
        label={t('settings.generalSettings.form.rememberUser')}
        buttonTooltip={t('settings.generalSettings.form.rememberUser.tooltip')}
      >
        <SwitchWithRelatedSettings
          boxPadding={0}
          boxMargin={0}
          withBorders={false}
          isVisible={true}
          label={t('settings.generalSettings.form.rememberUser')}
          defaultValue={
            generalSettings?.rememberUser?.isEnabled ??
            (isDefined(generalSettings?.isNewResultOnRefreshEnabled)
              ? !generalSettings?.isNewResultOnRefreshEnabled
              : false)
          }
          onChange={toggleRememberUser}
        >
          <FormControl
            mt={'20px'}
            label={t('settings.generalSettings.form.rememberUser.storage')}
            direction="row"
            moreInfoTooltip={
              <Stack>
                <Text>
                  {t('settings.generalSettings.form.rememberUser.choose')}{' '}
                  <Tag bgColor="gray.200">
                    {t('settings.generalSettings.form.rememberUser.session')}
                  </Tag>{' '}
                  {t('settings.generalSettings.form.rememberUser.remember')}
                </Text>
                <Text>
                  {t('settings.generalSettings.form.rememberUser.choose')}{' '}
                  <Tag bgColor="gray.200">
                    {t('settings.generalSettings.form.rememberUser.storage')}
                  </Tag>{' '}
                  {t('settings.generalSettings.form.rememberUser.remember.2')}
                </Text>
              </Stack>
            }
          >
            <ButtonSwitch
              selectedItem={generalSettings?.rememberUser?.storage ?? 'session'}
              onSelect={updateRememberUserStorage}
              items={rememberUserStorages}
            />
          </FormControl>
        </SwitchWithRelatedSettings>
      </Control>
    </Stack>
  )
}
