import { AccountApiTokensList } from '@/features/account/components/AccountApiTokensList'
import { useUser } from '@/hooks/useUser'
import type { NextPageWithLayout } from '@/pages/_app'
import Layout from '@/components/layouts/Layout'
import type { ReactNode } from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { BoxCard, H2 } from '@urbiport/ui'

const ApiTokensPage: NextPageWithLayout = () => {
  const { user } = useUser()
  const { t } = useTranslate()

  return (
    <BoxCard>
      <Stack spacing={1}>
        <H2>{t('account.apiTokens.heading')}</H2>
        <Text fontSize="sm" color="text.light">
          {t('account.apiTokens.description')}
        </Text>
      </Stack>
      {!!user && <AccountApiTokensList user={user} />}
    </BoxCard>
  )
}

ApiTokensPage.getLayout = function getLayout(page: ReactNode) {
  return <Layout>{page}</Layout>
}

export default ApiTokensPage
