import { useRouter } from 'next/router'
import React from 'react'
import { Stack, Box, Text } from '@chakra-ui/react'
import { useTranslate, useTolgee } from '@tolgee/react'
import { BoxCard, H2, Select, FormControl } from '@urbiport/ui'
import { useUser } from '@/hooks/useUser'
import { SelectOptions } from '@/types/shared'
import { LocaleValue } from '@/types/language'
import { AppearanceValue } from '@/types/appearance'
import { useLoadingSave } from '@/hooks/useLoadingSave'
import { env } from '@quickbot.io/env'

const localeHumanReadable: SelectOptions<LocaleValue> = [
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Português', value: 'pt' },
  { label: 'Português (BR)', value: 'pt-BR' },
  { label: 'Română', value: 'ro' },
  { label: 'Español', value: 'es' },
  { label: 'Italiano', value: 'it' },
] as const

export const AccountPreferencesForm = () => {
  const router = useRouter()
  const { t } = useTranslate()
  const { getLanguage } = useTolgee()
  const currentLanguage = getLanguage()
  const { user, updateUser } = useUser()
  const setLoadingSave = useLoadingSave()
  const appearanceData: SelectOptions<AppearanceValue> = [
    {
      value: 'light',
      label: t('account.preferences.appearance.lightLabel'),
    },
    {
      value: 'dark',
      label: t('account.preferences.appearance.darkLabel'),
    },
    {
      value: 'system',
      label: t('account.preferences.appearance.systemLabel'),
    },
  ] as const

  const changeAppearance = async (value: AppearanceValue) => {
    setLoadingSave()

    updateUser({ preferredAppAppearance: value })
  }

  const updateLocale = (locale: string | undefined) => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
    router.replace(
      {
        pathname: router.pathname,
        query: router.query,
      },
      undefined,
      { locale },
    )

    setLoadingSave()
  }

  return (
    <BoxCard>
      <Box display="flex" flexDirection="column" gap="8px">
        <H2>Preferences</H2>
        <Text fontSize="sm" color="text.light">
          Set your account preferences
        </Text>
      </Box>

      <Stack spacing={6} maxWidth="600px">
        <FormControl direction="row" label={t('account.preferences.appearance.heading')}>
          <Select
            withClear={false}
            selectedItem={(user?.preferredAppAppearance as AppearanceValue) ?? 'system'}
            onSelect={changeAppearance}
            items={appearanceData}
          />
        </FormControl>
        {env.NEXT_PUBLIC_BETA_ENV && (
          <FormControl
            direction="row"
            label={t('account.preferences.language.heading')}
            moreInfoTooltip={t('account.preferences.language.tooltip')}
          >
            <Select
              withClear={false}
              selectedItem={(currentLanguage as LocaleValue) ?? 'en'}
              onSelect={updateLocale}
              items={localeHumanReadable}
            />
          </FormControl>
        )}
      </Stack>
    </BoxCard>
  )
}
