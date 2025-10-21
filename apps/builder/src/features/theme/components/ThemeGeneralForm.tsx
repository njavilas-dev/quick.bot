import { Stack, Tooltip } from '@chakra-ui/react'
import { Background, ProgressBar, Theme } from '@quickbot.io/schemas'
import React from 'react'
import { BackgroundSelector } from './general/BackgroundSelector'
import { LockedIcon } from '@urbiport/icons'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useTranslate } from '@tolgee/react'
import {
  defaultProgressBarBackgroundColor,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { ProgressBarForm } from './general/ProgressBarForm'
import { FormControl, Switch, Control } from '@urbiport/ui'
import { Button } from '@chakra-ui/react'
import UpgradePlan from '@/features/billing/components/UpgradePlan'
import { BillingPlanType } from '@quickbot.io/prisma'
import { env } from '@quickbot.io/env'

type Props = {
  isBrandingEnabled: boolean
  generalTheme: Theme['general']
  onGeneralThemeChange: (general: Theme['general']) => void
  onBrandingChange: (isBrandingEnabled: boolean) => void
}

export const ThemeGeneralForm = ({
  isBrandingEnabled,
  generalTheme,
  onGeneralThemeChange,
  onBrandingChange,
}: Props) => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()

  const allowRemoveBrand = !!workspace?.billingPlan?.allowRemoveBrand

  const handleBackgroundChange = (background: Background) =>
    onGeneralThemeChange({ ...generalTheme, background })

  const updateProgressBar = (progressBar: ProgressBar) =>
    onGeneralThemeChange({ ...generalTheme, progressBar })

  const updateBranding = () => {
    if (isBrandingEnabled && !allowRemoveBrand) return
    onBrandingChange(!isBrandingEnabled)
  }

  return (
    <Stack spacing={3}>
      {allowRemoveBrand ? (
        <FormControl direction="row" label="Enable bot brand">
          <Switch id="branding" defaultValue={isBrandingEnabled} onChange={updateBranding} />
        </FormControl>
      ) : (
        <UpgradePlan
          excludedPlans={[BillingPlanType.FREE]}
          trigger={({ onOpen }) => (
            <Tooltip
              label={t('billing.upgradeLimitLabel', { type: t('billing.limitMessage.brand') })}
            >
              <Button onClick={onOpen} leftIcon={<LockedIcon />} variant="outline">
                Remove bot brand
              </Button>
            </Tooltip>
          )}
        />
      )}

      {env.NEXT_PUBLIC_BETA_ENV && (
        <Control
          label={t('theme.progressBar.enable.label')}
          pill={generalTheme?.progressBar?.backgroundColor ?? defaultProgressBarBackgroundColor}
        >
          <ProgressBarForm
            progressBar={generalTheme?.progressBar}
            onProgressBarChange={updateProgressBar}
          />
        </Control>
      )}
      <Control
        label={t('theme.sideMenu.global.background')}
        pill={
          generalTheme?.background?.content ??
          generalTheme?.background?.type?.toLowerCase() ??
          'none'
        }
      >
        <BackgroundSelector
          background={generalTheme?.background}
          onBackgroundChange={handleBackgroundChange}
        />
      </Control>
    </Stack>
  )
}
