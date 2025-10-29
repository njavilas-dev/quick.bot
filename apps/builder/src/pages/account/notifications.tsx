import type { NextPageWithLayout } from '@/pages/_app'
import type { ReactNode } from 'react'
import { AccountNotificationsForm } from '@/features/account/components/AccountNotificationsForm'
import { Stack, Text } from '@chakra-ui/react'
import { BoxCard, H2 } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const NotificationsPage: NextPageWithLayout = () => {
  const { t } = useTranslate()
  return (
    <BoxCard>
      <Stack spacing={1}>
        <H2>{t('settings.notifications.title.label')}</H2>
        <Text fontSize="sm" color="text.light">
          {t('settings.notifications.subtitle.label')}
        </Text>
      </Stack>
      <AccountNotificationsForm />
    </BoxCard>
  )
}

NotificationsPage.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default NotificationsPage
