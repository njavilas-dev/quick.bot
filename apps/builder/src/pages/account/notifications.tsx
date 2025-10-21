import type { NextPageWithLayout } from '@/pages/_app'
import Layout from '@/components/layouts/Layout'
import type { ReactNode } from 'react'
import { AccountNotificationsForm } from '@/features/account/components/AccountNotificationsForm'
import { Stack, Text } from '@chakra-ui/react'
import { BoxCard, H2 } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'

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
  return <Layout>{page}</Layout>
}

export default NotificationsPage
